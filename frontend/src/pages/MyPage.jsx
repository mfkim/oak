import {useState, useEffect} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import axios from 'axios';

function MyPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  const [activeTab, setActiveTab] = useState('posts');
  const [myPosts, setMyPosts] = useState([]);
  const [myReplies, setMyReplies] = useState([]);
  const [myLikes, setMyLikes] = useState([]);

  // 비밀번호 변경 상태
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    newPasswordCheck: ''
  });

  // 회원 탈퇴 상태
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawPassword, setWithdrawPassword] = useState('');

  // 내 정보 불러오기
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    axios.get('/api/users/me', {headers: {Authorization: `Bearer ${token}`}})
      .then(res => {
        setUser(res.data);
        if (res.data.profileImg) setPreview(`http://localhost:8080${res.data.profileImg}`);
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  // 탭 데이터 로딩
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (activeTab === 'posts') {
      axios.get('/api/users/me/posts', {headers: {Authorization: `Bearer ${token}`}})
        .then(res => setMyPosts(res.data));
    } else if (activeTab === 'replies') {
      axios.get('/api/users/me/replies', {headers: {Authorization: `Bearer ${token}`}})
        .then(res => setMyReplies(res.data));
    } else if (activeTab === 'likes') {
      axios.get('/api/users/me/likes', {headers: {Authorization: `Bearer ${token}`}})
        .then(res => setMyLikes(res.data));
    }
  }, [activeTab]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isImageDeleted', false);

    try {
      await axios.put('/api/users/profile', formData, {
        headers: {Authorization: `Bearer ${token}`}
      });
      alert('프로필 사진이 변경되었습니다! 😎');
      window.location.reload();
    } catch (err) {
      alert('업로드 실패');
    }
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm('기본 이미지로 되돌리시겠습니까?')) return;
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('isImageDeleted', true);

    try {
      await axios.put('/api/users/profile', formData, {
        headers: {Authorization: `Bearer ${token}`}
      });
      alert('기본 이미지로 변경되었습니다. 🧼');
      window.location.reload();
    } catch (err) {
      alert('삭제 실패');
    }
  };

  // 비밀번호 변경
  const handlePasswordInputChange = (e) => {
    const {name, value} = e.target;
    setPasswordData(prev => ({...prev, [name]: value}));
  };

  const handleSubmitPassword = async () => {
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.newPasswordCheck) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    if (passwordData.newPassword !== passwordData.newPasswordCheck) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      await axios.put('/api/users/password', passwordData, {
        headers: {Authorization: `Bearer ${token}`}
      });
      alert('비밀번호가 변경되었습니다. 다시 로그인해주세요.');
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data || '비밀번호 변경 실패');
    }
  };

  // 회원 탈퇴
  const handleWithdraw = async () => {
    if (!withdrawPassword) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    if (!window.confirm('정말로 탈퇴하시겠습니까? 작성한 모든 글과 정보가 삭제됩니다.')) return;

    const token = localStorage.getItem('token');
    try {
      await axios.delete('/api/users/me', {
        headers: {Authorization: `Bearer ${token}`},
        data: {password: withdrawPassword}
      });

      alert('회원 탈퇴가 완료되었습니다. 그동안 이용해주셔서 감사합니다. 🙇‍♂️');
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      navigate('/');
      window.location.reload();

    } catch (err) {
      alert(err.response?.data || '탈퇴 처리에 실패했습니다. 비밀번호를 확인해주세요.');
    }
  };

  if (!user) return <div className="text-center py-20">로딩 중... ⏳</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4 relative">
      {/* 상단 프로필 카드 */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center mb-8">

        {/* 프로필 이미지 영역 */}
        <div className="relative inline-block mb-4 group">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100 mx-auto shadow-sm">
            {preview ? (
              <img src={preview} alt="Profile" className="w-full h-full object-cover"/>
            ) : (
              <div className="w-full h-full bg-gray-50 flex items-center justify-center text-3xl text-gray-300">👤</div>
            )}
          </div>

          <label
            className="absolute bottom-0 right-0 bg-white border border-gray-200 text-gray-600 p-1.5 rounded-full cursor-pointer shadow-sm hover:bg-gray-50 hover:text-green-600 transition-colors">
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange}/>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                 stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"/>
            </svg>
          </label>

          {user.profileImg && (
            <button onClick={handleDeleteProfile}
                    className="absolute bottom-0 -right-8 text-xs text-gray-400 hover:text-red-500 bg-white border border-gray-200 px-2 py-1 rounded-md shadow-sm transition-colors"
                    title="기본 이미지로 변경">
              삭제
            </button>
          )}
        </div>

        <h2 className="text-xl font-bold text-gray-800">{user.username}</h2>
        <p className="text-gray-500 text-sm mb-4">{user.email}</p>

        {file && (
          <button onClick={handleUpload}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm px-6 py-2 rounded-lg font-bold shadow-md transition-all animate-bounce-short mb-4">
            이미지 저장하기
          </button>
        )}

        {/* 비밀번호 변경 */}
        <div className="mt-6 border-t border-gray-100 pt-6">
          <button onClick={() => setShowPasswordModal(true)}
                  className="text-gray-500 hover:text-green-600 text-sm font-medium underline underline-offset-4 transition-colors">
            비밀번호 변경
          </button>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="flex border-b border-gray-200 mb-6">
        <button onClick={() => setActiveTab('posts')}
                className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'posts' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
          📝 내가 쓴 글
        </button>
        <button onClick={() => setActiveTab('replies')}
                className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'replies' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
          💬 내가 쓴 댓글
        </button>
        <button onClick={() => setActiveTab('likes')}
                className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'likes' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
          ❤️ 좋아요 한 글
        </button>
      </div>

      {/* 리스트 */}
      <div className="space-y-4 pb-20">
        {activeTab === 'posts' && (
          myPosts.length > 0 ? myPosts.map(post => (
            <Link to={`/post/${post.id}`} key={post.id}
                  className="block bg-white p-5 rounded-xl border border-gray-100 hover:shadow-md transition-all">
              <h3 className="font-bold text-gray-800 mb-1">{post.title}</h3>
              <div className="text-xs text-gray-400 flex gap-2">
                <span>{new Date(post.createDate).toLocaleDateString()}</span>
                <span>• 조회 {post.view}</span>
                <span>• 추천 {post.voter ? post.voter.length : 0}</span>
              </div>
            </Link>
          )) : <div className="text-center py-10 text-gray-400">작성한 글이 없습니다. 🍃</div>
        )}

        {activeTab === 'replies' && (
          myReplies.length > 0 ? myReplies.map(reply => (
            <Link to={`/post/${reply.post.id}`} key={reply.id}
                  className="block bg-white p-5 rounded-xl border border-gray-100 hover:shadow-md transition-all">
              <div className="text-sm text-gray-800 mb-2">"{reply.content}"</div>
              <div className="text-xs text-gray-400">
                <span className="font-bold text-green-600">원문: {reply.post.title}</span>
                <span className="mx-2">•</span>
                <span>{new Date(reply.createDate).toLocaleDateString()}</span>
              </div>
            </Link>
          )) : <div className="text-center py-10 text-gray-400">작성한 댓글이 없습니다. 🍃</div>
        )}

        {activeTab === 'likes' && (
          myLikes.length > 0 ? myLikes.map(post => (
            <Link to={`/post/${post.id}`} key={post.id}
                  className="block bg-white p-5 rounded-xl border border-gray-100 hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-red-500 text-sm">❤️</span>
                <h3 className="font-bold text-gray-800">{post.title}</h3>
              </div>
              <div className="text-xs text-gray-400 flex gap-2 pl-6">
                <span>작성자: {post.author ? post.author.username : '익명'}</span>
                <span>• {new Date(post.createDate).toLocaleDateString()}</span>
              </div>
            </Link>
          )) : <div className="text-center py-10 text-gray-400">좋아요를 누른 글이 없습니다. 🍃</div>
        )}
      </div>

      {/* 회원 탈퇴 버튼 */}
      <div className="text-center pb-20 mt-10">
        <button
          onClick={() => setShowWithdrawModal(true)}
          className="text-xs text-gray-400 hover:text-red-500 underline transition-colors"
        >
          회원 탈퇴하기
        </button>
      </div>


      {/* --- 모달 --- */}

      {/* 비밀번호 변경 모달 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-fade-in-up">
            <h3 className="text-lg font-bold text-gray-800 mb-4">비밀번호 변경 🔐</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">현재 비밀번호</label>
                <input type="password" name="oldPassword" value={passwordData.oldPassword}
                       onChange={handlePasswordInputChange}
                       className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"
                       placeholder="현재 사용중인 비밀번호"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">새 비밀번호</label>
                <input type="password" name="newPassword" value={passwordData.newPassword}
                       onChange={handlePasswordInputChange}
                       className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"
                       placeholder="변경할 비밀번호"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">새 비밀번호 확인</label>
                <input type="password" name="newPasswordCheck" value={passwordData.newPasswordCheck}
                       onChange={handlePasswordInputChange}
                       className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"
                       placeholder="한 번 더 입력해주세요"/>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => {
                setShowPasswordModal(false);
                setPasswordData({oldPassword: '', newPassword: '', newPasswordCheck: ''});
              }}
                      className="flex-1 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg font-medium transition-colors">취소
              </button>
              <button onClick={handleSubmitPassword}
                      className="flex-1 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg font-bold shadow-md transition-colors">변경하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ★회원 탈퇴 모달 */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-fade-in-up border-2 border-red-50">
            <h3 className="text-lg font-bold text-red-600 mb-2">회원 탈퇴 ⚠️</h3>
            <p className="text-gray-600 text-sm mb-4">
              탈퇴 시 작성하신 <strong>모든 글과 댓글, 정보가 영구 삭제</strong>되며 복구할 수 없습니다.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 mb-1">비밀번호 확인</label>
              <input
                type="password"
                value={withdrawPassword}
                onChange={(e) => setWithdrawPassword(e.target.value)}
                className="w-full px-3 py-2 border border-red-100 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm bg-red-50"
                placeholder="비밀번호를 입력하세요"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawPassword('');
                }}
                className="flex-1 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleWithdraw}
                className="flex-1 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg font-bold shadow-md transition-colors"
              >
                탈퇴하기
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default MyPage;
