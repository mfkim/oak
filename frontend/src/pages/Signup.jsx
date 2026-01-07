import {useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import axios from 'axios';

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    passwordCheck: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. 클라이언트 측 유효성 검사 (비밀번호 일치 여부)
    if (formData.password !== formData.passwordCheck) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      // 2. 서버에 회원가입 요청
      await axios.post('/api/auth/signup', formData);

      alert('회원가입이 완료되었습니다! 로그인해주세요.');
      navigate('/login');

    } catch (error) {
      console.error(error);
      alert(error.response?.data || '회원가입에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 w-full max-w-md">

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">회원가입</h2>
          <p className="text-gray-500 mt-2">참나무 숲의 일원이 되어보세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">아이디</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="아이디"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="example@oak.com"
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
              placeholder="비밀번호"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
            <input
              type="password"
              name="passwordCheck"
              value={formData.passwordCheck}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="비밀번호 한 번 더 입력"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md hover:shadow-lg mt-4"
          >
            가입하기
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold hover:underline">
            로그인
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Signup;
