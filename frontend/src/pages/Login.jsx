import {useState} from 'react';
import {Link} from 'react-router-dom'; // useNavigate는 안 써서 삭제 (window.location 사용)
import axios from 'axios';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  // 에러 메시지
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/api/auth/login', formData);
      const {accessToken, username} = response.data;

      localStorage.setItem('token', accessToken);
      localStorage.setItem('username', username);

      window.location.href = '/';

    } catch (error) {
      console.error(error);

      // 서버에서 보내준 에러 메시지 화면에 표시
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data);
      } else {
        setErrorMessage('로그인 서버 연결에 실패했습니다.');
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 w-full max-w-md">

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">로그인</h2>
          <p className="text-gray-500 mt-2">참나무 숲에 오신 것을 환영합니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">아이디</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="아이디를 입력하세요"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          {/* 에러 메시지 */}
          {errorMessage && (
            <div
              className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg border border-red-100 animate-pulse">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200"
          >
            로그인 하기
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          아직 계정이 없으신가요?{' '}
          <Link to="/signup" className="text-green-600 hover:text-green-700 font-semibold hover:underline">
            회원가입
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Login;
