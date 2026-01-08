import {useState, useEffect, useRef, useCallback} from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';

function Home() {
  const [posts, setPosts] = useState([]);      // 게시글 목록 (계속 누적됨)
  const [page, setPage] = useState(0);         // 현재 페이지 번호
  const [loading, setLoading] = useState(false); // 로딩 중인지 여부
  const [hasMore, setHasMore] = useState(true);  // 더 가져올 글이 있는지 여부

  const observerTarget = useRef(null); // 바닥 감지용 타겟 (HTML 요소)

  // 1. 데이터 불러오기 함수
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/posts?page=${page}`);
      const newPosts = res.data.content;
      const isLast = res.data.last; // 마지막 페이지인지 여부 (Page 객체에 포함됨)

      // 기존 데이터 뒤에 새 데이터 붙이기
      setPosts(prev => {
        // 1. 기존 게시글들의 ID를 모아둔 Set을 만듭니다.
        const existingIds = new Set(prev.map(post => post.id));

        // 2. 새로 온 글들 중에서, 이미 있는 ID는 걸러냅니다.
        const uniqueNewPosts = newPosts.filter(post => !existingIds.has(post.id));

        // 3. 기존 글 + 걸러진 새 글을 합칩니다.
        return [...prev, ...uniqueNewPosts];
      });

      if (isLast) {
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  // 2. 페이지(page) 번호가 바뀌면 데이터 요청
  useEffect(() => {
    // 이미 마지막 페이지거나 로딩 중이면 요청하지 않음
    // (단, 첫 페이지인 page 0은 무조건 실행)
    if (page > 0 && !hasMore) return;

    fetchPosts();
  }, [page, fetchPosts, hasMore]);


  // 3. Intersection Observer (바닥 감지 센서) 설정
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // 타겟이 화면에 보이고(isIntersecting), 더 불러올 게 있고(hasMore), 로딩 중이 아닐 때
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1); // 페이지 번호 1 증가 -> 위의 useEffect가 실행됨
        }
      },
      {threshold: 1.0} // 타겟이 100% 보였을 때 실행
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading]);


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
                <h3
                  className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2 group-hover:text-green-700 transition-colors">
                  <span className="line-clamp-1">{post.title}</span>
                  {/* 댓글 개수 배지 */}
                  {post.replyList && post.replyList.length > 0 && (
                    <span
                      className="flex-shrink-0 text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                      {post.replyList.length}
                    </span>
                  )}
                </h3>

                <p className="text-gray-500 text-sm mb-4 line-clamp-2 h-10">
                  {post.content}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3">
                  <span className="flex items-center gap-1">
                    👤 {post.author ? post.author.username : '익명'}
                  </span>
                  <span>{new Date(post.createDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ★ 4. 무한 스크롤 감지용 센서 (Target) */}
      {/* 데이터가 더 있고(loading 중이 아닐 때) 보여질 요소 */}
      {hasMore && (
        <div
          ref={observerTarget}
          className="h-20 flex justify-center items-center mt-8 text-gray-400"
        >
          {loading ? '열심히 불러오는 중... 🏃‍♂️' : '더 보려면 스크롤을 내려주세요 👇'}
        </div>
      )}

      {/* 데이터가 끝났을 때 표시 */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl mt-8">
          모든 이야기를 다 불러왔습니다. 🌲
        </div>
      )}
    </div>
  );
}

export default Home;
