import {useState, useEffect, useCallback} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import axios from 'axios';
import CommentSection from '../components/CommentSection';

function PostDetail() {
  const {id} = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);

  // 로그인한 사용자 정보 가져오기
  const currentUser = localStorage.getItem('username');

  // 게시글 데이터 불러오기
  const fetchPost = useCallback(() => {
    axios.get(`/api/posts/${id}`)
      .then(res => setPost(res.data))
      .catch(err => console.error(err));
  }, [id]);

  // 페이지가 처음 뜰 때 데이터 불러오기
  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/posts/${id}`, {
        headers: {Authorization: `Bearer ${token}`}
      });
      alert('삭제되었습니다.');
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('삭제 권한이 없거나 오류가 발생했습니다.');
    }
  };

  if (!post) return <div className="text-center py-20">로딩 중... ⏳</div>;

  return (
    <div className="max-w-3xl mx-auto">
      {/* 상단 네비게이션 */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-green-700">
          ← 목록으로
        </button>

        {/* 작성자 본인일 때만 수정/삭제 버튼 표시 */}
        {currentUser === post.author.username && (
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/edit/${id}`)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      {/* 게시글 내용 및 댓글 영역 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

        <div className="flex items-center gap-4 text-sm text-gray-500 border-b border-gray-100 pb-6 mb-6">
          <span>👤 {post.author.username}</span>
          <span>•</span>
          <span>{new Date(post.createDate).toLocaleString()}</span>
          <span>•</span>
          <span>조회수 {post.view}</span>
        </div>

        <div className="prose prose-green max-w-none text-gray-700 leading-relaxed whitespace-pre-line mb-10">
          {post.content}
        </div>

        {/* ★ 댓글 섹션 연결 */}
        <CommentSection
          postId={id}
          replies={post.replyList || []} // 댓글 목록 전달 (없으면 빈 배열)
          onCommentChange={fetchPost}    // 댓글 변경 시 부모에게 알림 (데이터 갱신용)
        />
      </div>
    </div>
  );
}

export default PostDetail;
