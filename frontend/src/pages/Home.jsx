import {useState, useEffect, useRef, useCallback} from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';

function Home() {
  const [posts, setPosts] = useState([]);      // 게시글 목록
  const [page, setPage] = useState(0);         // 현재 페이지 번호
  const [loading, setLoading] = useState(false); // 로딩 중
  const [hasMore, setHasMore] = useState(true);  // 더 가져올 글이 있는지

  // 검색 관련 상태 추가
  const [kw, setKw] = useState("");            // 실제 검색에 사용될 키워드
  const [inputText, setInputText] = useState(""); // 검색창 입력값

  const observerTarget = useRef(null); // 바닥 감지용 타겟

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      // API 호출 시 검색어(kw)도 함께 전송
      const res = await axios.get(`/api/posts?page=${page}&kw=${kw}`);
      const newPosts = res.data.content;
      const isLast = res.data.last;

      setPosts(prev => {
        // 페이지가 0번이면 (검색했거나 새로고침) -> 기존 데이터를 싹 갈아치움
        if (page === 0) {
          return newPosts;
        }

        // 페이지가 0번이 아니면 (스크롤 내림) -> 기존 데이터 뒤에 붙임 (중복 제거 포함)
        const existingIds = new Set(prev.map(post => post.id));
        const uniqueNewPosts = newPosts.filter(post => !existingIds.has(post.id));

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
  }, [page, kw]);

  // 페이지나 검색어가 바뀌면 데이터 요청
  useEffect(() => {
    if (page > 0 && !hasMore) return;
    fetchPosts();
  }, [page, kw, fetchPosts, hasMore]);


  // 바닥 감지
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1);
        }
      },
      {threshold: 1.0}
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

  // 검색
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);       // 1. 페이지를 0으로 리셋
    setPosts([]);     // 2. 기존 목록 비우기
    setHasMore(true); // 3. 더 보기 상태 리셋
    setKw(inputText); // 4. 실제 검색어 업데이트
  };

  return (
    <div className="max-w-4xl mx-auto">

      {/* ★ 상단 헤더 및 검색창 영역 */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">최신 글 목록 📝</h2>
          <p className="text-gray-500 mt-1">숲 속의 이야기를 들어보세요.</p>
        </div>

        {/* 검색 */}
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="검색어를 입력하세요..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-full md:w-64 transition-all"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-colors whitespace-nowrap shadow-sm"
          >
            검색
          </button>
        </form>
      </div>

      {/* 게시글 */}
      <div className="grid gap-6 md:grid-cols-2">
        {posts.length > 0 ? (
          posts.map(post => (
            <Link to={`/post/${post.id}`} key={post.id} className="block group">
              <div
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div
                  className="h-32 bg-green-50 flex items-center justify-center text-green-200 text-4xl group-hover:bg-green-100 transition-colors">
                  🌳
                </div>

                <div className="p-5">
                  <h3
                    className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2 group-hover:text-green-700 transition-colors">
                    <span className="line-clamp-1">{post.title}</span>
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
          ))
        ) : (
          /* ★ 검색 결과가 0개일 때 */
          !loading && (
            <div className="col-span-2 text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500 text-lg">검색 결과가 없습니다. 🍃</p>
              <button
                onClick={() => {
                  setInputText('');
                  setKw('');
                  setPage(0);
                  setHasMore(true);
                }}
                className="mt-2 text-green-600 font-medium hover:underline text-sm"
              >
                전체 목록으로 돌아가기
              </button>
            </div>
          )
        )}
      </div>

      {/* 무한 스크롤 감지용 센서 */}
      {hasMore && (
        <div
          ref={observerTarget}
          className="h-20 flex justify-center items-center mt-8 text-gray-400"
        >
          {loading ? '열심히 불러오는 중... 🏃‍♂️' : ''}
        </div>
      )}

      {/* 데이터 끝 표시 (결과가 있을 때만) */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl mt-8">
          모든 이야기를 다 불러왔습니다. 🌲
        </div>
      )}
    </div>
  );
}

export default Home;
