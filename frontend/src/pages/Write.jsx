import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Write() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // 1. 로그인 여부 체크
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    try {
      // 2. 서버로 데이터 전송 (헤더에 토큰 포함)
      await axios.post('/api/posts',
        {
          title: title,
          content: content
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert('글 작성이 완료되었습니다! 🌲');
      navigate('/');

    } catch (error) {
      console.error(error);
      alert('글 작성에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">새 글 작성하기</h2>
        <p className="text-gray-500 mt-1">숲속에 당신의 이야기를 남겨보세요.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-lg font-medium"
              placeholder="제목을 입력하세요"
              required
            />
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all h-64 resize-none"
              placeholder="어떤 이야기를 나누고 싶으신가요?"
              required
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)} // 뒤로가기
              className="px-6 py-3 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              등록하기
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default Write;
