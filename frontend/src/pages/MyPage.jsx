import {useState, useEffect} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import axios from 'axios';

function MyPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  // 탭 (posts, replies, likes)
  const [activeTab, setActiveTab] = useState('posts');

  // 데이터 목록
  const [myPosts, setMyPosts] = useState([]);
  const [myReplies, setMyReplies] = useState([]);
  const [myLikes, setMyLikes] = useState([]);

  // 1. 내 정보 불러오기
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    // 기본 유저 정보 가져오기
    axios.get('/api/users/me', {headers: {Authorization: `Bearer ${token}`}})
      .then(res => {
        setUser(res.data);
        if (res.data.profileImg) setPreview(`http://localhost:8080${res.data.profileImg}`);
      })
      .catch(() => navigate('/login'));

  }, [navigate]);

  // 2. 탭이 바뀔 때마다 해당 데이터 가져오기
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
      const res = await axios.put('/api/users/profile', formData, {
        headers: {Authorization: `Bearer ${token}`}
      });
      setPreview(`http://localhost:8080${res.data}`);
      alert('프로필 사진이 변경되었습니다! 😎');
      window.location.reload();
    } catch (err) {
      alert('업로드 실패');
    }
  };

  // 프로필 삭제
  const handleDeleteProfile = async () => {
    if (!window.confirm('기본 이미지로 되돌리시겠습니까?')) return;

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('isImageDeleted', true);

    try {
      await axios.put('/api/users/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('기본 이미지로 변경되었습니다. 🧼');
      window.location.reload();
    } catch (err) {
      alert('삭제 실패');
    }
  };

  if (!user) return <div className="text-center py-20">로딩 중... ⏳</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      {/* 1. 상단 프로필 카드 */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center mb-8">
        <div className="relative inline-block mb-4 group">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-green-50 mx-auto shadow-sm">
            {preview ? (
              <img src={preview} alt="Profile" className="w-full h-full object-cover"/>
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-3xl text-gray-300">👤</div>
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-white border border-gray-200 text-gray-600 p-1.5 rounded-full cursor-pointer shadow-sm hover:bg-gray-50 hover:text-green-600 transition-colors">
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange}/>
            {/* 카메라 아이콘 */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
          </label>
          {/* 삭제 버튼 - 이미지가 있을 때만 우측에 표시 */}
          {user.profileImg && (
            <button
              onClick={handleDeleteProfile}
              className="absolute bottom-0 -right-8 text-xs text-gray-400 hover:text-red-500 bg-white border border-gray-200 px-2 py-1 rounded-md shadow-sm transition-colors"
              title="기본 이미지로 변경"
            >
              삭제
            </button>
          )}
        </div>

        <h2 className="text-xl font-bold text-gray-800">{user.username}</h2>
        <p className="text-gray-500 text-sm mb-4">{user.email}</p>

        {/* 파일 선택 시 저장 버튼 */}
        {file && (
          <button onClick={handleUpload}
                  className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg font-bold shadow-sm animate-bounce-short">
            이미지 저장하기
          </button>
        )}
      </div>

      {/* 2. 탭 메뉴 */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'posts' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          📝 내가 쓴 글
        </button>
        <button
          onClick={() => setActiveTab('replies')}
          className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'replies' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          💬 내가 쓴 댓글
        </button>
        <button
          onClick={() => setActiveTab('likes')}
          className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'likes' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          ❤️ 좋아요 한 글
        </button>
      </div>

      {/* 3. 리스트 */}
      <div className="space-y-4 pb-20">

        {/* 내가 쓴 글 */}
        {activeTab === 'posts' && (
          myPosts.length > 0 ? (
            myPosts.map(post => (
              <Link to={`/post/${post.id}`} key={post.id}
                    className="block bg-white p-5 rounded-xl border border-gray-100 hover:shadow-md transition-all">
                <h3 className="font-bold text-gray-800 mb-1">{post.title}</h3>
                <div className="text-xs text-gray-400 flex gap-2">
                  <span>{new Date(post.createDate).toLocaleDateString()}</span>
                  <span>• 조회 {post.view}</span>
                  <span>• 추천 {post.voter ? post.voter.length : 0}</span>
                </div>
              </Link>
            ))
          ) : <div className="text-center py-10 text-gray-400">작성한 글이 없습니다. 🍃</div>
        )}

        {/* 내가 쓴 댓글 */}
        {activeTab === 'replies' && (
          myReplies.length > 0 ? (
            myReplies.map(reply => (
              <Link to={`/post/${reply.post.id}`} key={reply.id}
                    className="block bg-white p-5 rounded-xl border border-gray-100 hover:shadow-md transition-all">
                <div className="text-sm text-gray-800 mb-2">"{reply.content}"</div>
                <div className="text-xs text-gray-400">
                  <span className="font-bold text-green-600">원문: {reply.post.title}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(reply.createDate).toLocaleDateString()}</span>
                </div>
              </Link>
            ))
          ) : <div className="text-center py-10 text-gray-400">작성한 댓글이 없습니다. 🍃</div>
        )}

        {/* 좋아요 한 글 */}
        {activeTab === 'likes' && (
          myLikes.length > 0 ? (
            myLikes.map(post => (
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
            ))
          ) : <div className="text-center py-10 text-gray-400">좋아요를 누른 글이 없습니다. 🍃</div>
        )}

      </div>
    </div>
  );
}

export default MyPage;
