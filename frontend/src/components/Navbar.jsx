import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  // 로그인 상태 확인
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');

    if (token) {
      setIsLoggedIn(true);
      setUsername(storedUsername || '사용자');
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // 로그아웃
  const handleLogout = () => {
    // 1. 저장소 비우기 (토큰 삭제)
    localStorage.removeItem('token');
    localStorage.removeItem('username');

    // 2. 상태 초기화 및 알림
    setIsLoggedIn(false);
    alert('로그아웃 되었습니다. 🍃');

    // 3. 홈으로 이동하며 새로고침
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* 로고 영역 */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <span className="text-2xl">🌲</span>
              <span className="font-bold text-xl text-green-800 tracking-tight">
                참나무 숲
              </span>
            </Link>
          </div>

          {/* 메뉴 영역 */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              // 로그인 상태
              <>
                <span className="text-sm text-gray-500 hidden sm:block">
                  <span className="font-bold text-green-700">{username}</span>님 환영합니다
                </span>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600 font-medium transition-colors text-sm"
                >
                  로그아웃
                </button>
                <Link to="/write" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm text-sm">
                  글쓰기
                </Link>
              </>
            ) : (
              // 로그아웃 상태
              <>
                <Link to="/login" className="text-gray-600 hover:text-green-700 font-medium transition-colors">
                  로그인
                </Link>
                <Link to="/signup" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
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
