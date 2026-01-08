import {useState, useEffect} from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';

function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get('/api/posts')
      .then(res => setPosts(res.data.content)) // Page 객체이므로 .content로 배열 접근
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">최신 글 목록 📝</h2>
        <p className="text-gray-500 mt-1">숲 속의 이야기를 들어보세요.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {posts.map(post => (
          <Link to={`/post/${post.id}`} key={post.id} className="block group">
            <div
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              {/* 이미지 영역 */}
              <div
                className="h-32 bg-green-50 flex items-center justify-center text-green-200 text-4xl group-hover:bg-green-100 transition-colors">
                🌳
              </div>

              <div className="p-5">
                {/* ★ 제목 및 댓글 수 영역 수정 */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2 group-hover:text-green-700 transition-colors">
                  {/* 제목: 길어지면 ... 처리 */}
                  <span className="line-clamp-1">
                    {post.title}
                  </span>

                  {/* ★ 댓글 개수 배지 (1개 이상일 때만 표시) */}
                  {post.replyList && post.replyList.length > 0 && (
                    <span className="flex-shrink-0 text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                      {post.replyList.length}
                    </span>
                  )}
                </h3>

                {/* 본문 미리보기 */}
                <p className="text-gray-500 text-sm mb-4 line-clamp-2 h-10">
                  {post.content}
                </p>

                {/* 하단 정보 (작성자, 날짜) */}
                <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3">
                  <span className="flex items-center gap-1">
                    👤 {post.author ? post.author.username : '알 수 없음'}
                  </span>
                  <span>
                    {new Date(post.createDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;
