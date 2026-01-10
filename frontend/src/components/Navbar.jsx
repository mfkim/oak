import {useState, useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import axios from 'axios';

function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [profileImg, setProfileImg] = useState(null);

  // 로그인 상태 확인 및 내 정보 가져오기
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');

    if (token) {
      setIsLoggedIn(true);
      setUsername(storedUsername || '사용자');

      // 서버에서 내 정보(프로필 사진 포함) 가져오기
      axios.get('/api/users/me', {
        headers: {Authorization: `Bearer ${token}`}
      })
        .then(res => {
          setProfileImg(res.data.profileImg);
        })
        .catch(err => {
          console.error("내 정보 로딩 실패:", err);
        });

    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    alert('로그아웃 되었습니다. 🍃');
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* 로고 */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <span className="text-2xl group-hover:scale-110 transition-transform">🌲</span>
              <span className="font-bold text-xl text-green-800 tracking-tight">
                참나무 숲
              </span>
            </Link>
          </div>

          {/* 메뉴 */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Link
                  to="/mypage"
                  className="flex items-center gap-2 text-sm text-gray-500 hidden sm:flex hover:bg-gray-50 px-3 py-1.5 rounded-full transition-all group mr-1"
                  title="마이 페이지로 이동"
                >
                  {/* ★ 프로필 이미지 표시 */}
                  {profileImg ? (
                    <img
                      src={`http://localhost:8080${profileImg}`}
                      alt="Profile"
                      className="w-6 h-6 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <span className="text-lg">👤</span>
                  )}

                  <span className="font-bold text-green-700 group-hover:text-green-800">{username}</span>
                  <span>님</span>
                </Link>

                <button onClick={handleLogout}
                        className="text-gray-600 hover:text-red-600 font-medium transition-colors text-sm">
                  로그아웃
                </button>
                <Link to="/write"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm text-sm">
                  글쓰기
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-green-700 font-medium transition-colors">
                  로그인
                </Link>
                <Link to="/signup"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
