import {useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';

function CommentSection({postId, replies, onCommentChange}) {
  const [content, setContent] = useState('');
  const currentUser = localStorage.getItem('username');
  const navigate = useNavigate();

  // 1. 댓글 등록
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      await axios.post(`/api/posts/${postId}/replies`,
        {content},
        {headers: {Authorization: `Bearer ${token}`}}
      );

      setContent(''); // 입력창 비우기
      onCommentChange();

    } catch (error) {
      console.error(error);
      alert('댓글 등록에 실패했습니다.');
    }
  };

  // 2. 댓글 삭제
  const handleDelete = async (replyId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/posts/replies/${replyId}`, {
        headers: {Authorization: `Bearer ${token}`}
      });

      onCommentChange(); // 데이터 갱신

    } catch (error) {
      console.error(error);
      alert('삭제 권한이 없거나 오류가 발생했습니다.');
    }
  };

  return (
    <div className="mt-10 border-t border-gray-100 pt-10">
      <h3 className="text-xl font-bold text-gray-800 mb-6">
        댓글 <span className="text-green-600">{replies.length}</span>
      </h3>

      {/* 댓글 작성 폼 */}
      <form onSubmit={handleSubmit} className="mb-10">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none min-h-[100px]"
            placeholder="따뜻한 댓글을 남겨주세요..."
          />
          <button
            type="submit"
            className="absolute bottom-3 right-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            등록
          </button>
        </div>
      </form>

      {/* 댓글 목록 */}
      <div className="space-y-6">
        {replies.length > 0 ? (
          replies.map((reply) => (
            <div key={reply.id} className="flex gap-4 group">
              <div
                className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold flex-shrink-0">
                {reply.author.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-900">
                    {reply.author.username}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {new Date(reply.createDate).toLocaleString()}
                    </span>
                    {/* 내 댓글일 때만 삭제 버튼 표시 */}
                    {currentUser === reply.author.username && (
                      <button
                        onClick={() => handleDelete(reply.id)}
                        className="text-gray-400 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {reply.content}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 py-8">
            아직 작성된 댓글이 없습니다. 첫 번째 댓글을 남겨보세요! 🍃
          </p>
        )}
      </div>
    </div>
  );
}

export default CommentSection;
