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

  // 게시글 추천 기능
  const handleLike = async () => {
    const token = localStorage.getItem('token');

    // 1. 비로그인 상태 체크
    if (!token) {
      alert('로그인이 필요한 기능입니다.');
      navigate('/login');
      return;
    }

    try {
      // 2. 좋아요 API 호출 (토글 방식)
      await axios.post(`/api/posts/${id}/like`, {}, {
        headers: {Authorization: `Bearer ${token}`}
      });

      // 3. 데이터 갱신
      fetchPost();

    } catch (error) {
      console.error(error);
      alert('오류가 발생했습니다.');
    }
  };

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

  // 내가 좋아요를 눌렀는지 확인
  const isLiked = post.voter?.some(v => v.username === currentUser);

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

          {/* ★ 좋아요 버튼 UI */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 px-3 py-1 rounded-full border transition-all ml-auto ${
              isLiked
                ? 'bg-red-50 border-red-200 text-red-600' // 좋아요 눌렀을 때 (빨강)
                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50' // 안 눌렀을 때 (회색)
            }`}
          >
            {/* 하트 아이콘 */}
            <span className="text-lg">{isLiked ? '❤️' : '🤍'}</span>

            {/* 좋아요 개수 */}
            <span className="font-bold">
              {post.voter ? post.voter.length : 0}
            </span>
          </button>
        </div>

        {/* ★ 이미지 표시 영역 (파일이 있을 때만 렌더링) */}
        {post.filePath && (
          <div className="mb-8 rounded-xl overflow-hidden border border-gray-100">
            <img
              src={`http://localhost:8080${post.filePath}`}
              alt="게시글 첨부 이미지"
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        <div className="prose prose-green max-w-none text-gray-700 leading-relaxed whitespace-pre-line mb-10">
          {post.content}
        </div>

        {/* 댓글 섹션 연결 */}
        <CommentSection
          postId={id}
          replies={post.replyList || []}
          onCommentChange={fetchPost}
        />
      </div>
    </div>
  );
}

export default PostDetail;
