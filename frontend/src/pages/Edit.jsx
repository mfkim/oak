import {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import axios from 'axios';

function Edit() {
  const {id} = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // 기존 데이터 불러오기
  useEffect(() => {
    axios.get(`/api/posts/${id}`)
      .then(res => {
        setTitle(res.data.title);
        setContent(res.data.content);
      })
      .catch(err => {
        console.error(err);
        alert('글을 불러오는데 실패했습니다.');
        navigate(-1);
      });
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      // 수정 요청 (PUT) 보내기
      await axios.put(`/api/posts/${id}`,
        {title, content},
        {headers: {Authorization: `Bearer ${token}`}}
      );

      alert('수정이 완료되었습니다! ✨');
      navigate(`/post/${id}`); // 상세 페이지로 이동
    } catch (error) {
      console.error(error);
      alert('수정에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">글 수정하기 ✏️</h2>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none h-64 resize-none"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-lg text-gray-600 hover:bg-gray-100 font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold shadow-md"
            >
              수정 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Edit;
