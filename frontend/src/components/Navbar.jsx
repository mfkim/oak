function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* 로고 */}
          <div className="flex items-center">
            <a href="/" className="flex-shrink-0 flex items-center gap-2">
              <span className="text-2xl">🌲</span>
              <span className="font-bold text-xl text-green-800 tracking-tight">
                참나무 숲
              </span>
            </a>
          </div>

          {/* 메뉴 */}
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-600 hover:text-green-700 font-medium transition-colors">
              로그인
            </a>
            <a href="#"
               className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
              회원가입
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
