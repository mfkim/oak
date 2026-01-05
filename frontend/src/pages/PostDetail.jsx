import {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom'; // URL 파라미터 가져오기, 뒤로가기
import axios from 'axios';

function PostDetail() {
  const {id} = useParams(); // URL에서 { id } 부분을 꺼내옵니다.
  const navigate = useNavigate();
  const [post, setPost] = useState(null); // 초기값은 null (로딩 중)

  useEffect(() => {
    // 상세 조회 API 호출
    axios.get(`/api/posts/${id}`)
      .then(res => setPost(res.data))
      .catch(err => console.error(err));
  }, [id]);

  // 데이터가 아직 안 왔으면 로딩 표시
  if (!post) {
    return <div className="text-center py-20 text-gray-500">데이터를 불러오는 중입니다... ⏳</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-gray-500 hover:text-green-700 flex items-center gap-1 transition-colors"
      >
        ← 목록으로 돌아가기
      </button>

      {/* 게시글 본문 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

        <div className="flex items-center gap-4 text-sm text-gray-500 border-b border-gray-100 pb-6 mb-6">
          <span className="flex items-center gap-1">
            👤 <span className="font-medium text-gray-700">{post.author.username}</span>
          </span>
          <span>•</span>
          <span>{new Date(post.createDate).toLocaleString()}</span>
          <span>•</span>
          <span>조회수 {post.view}</span>
        </div>

        <div className="prose prose-green max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
          {post.content}
        </div>
      </div>
    </div>
  );
}

export default PostDetail;
