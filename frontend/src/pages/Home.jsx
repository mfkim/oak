import {useState, useEffect, useRef, useCallback} from 'react';
import axios from 'axios';
import {Link, useNavigate} from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [kw, setKw] = useState("");
  const [inputText, setInputText] = useState("");

  const currentUser = localStorage.getItem('username');
  const observerTarget = useRef(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/posts?page=${page}&kw=${kw}`);
      const newPosts = res.data.content;
      const isLast = res.data.last;

      setPosts(prev => {
        if (page === 0) return newPosts;
        const existingIds = new Set(prev.map(post => post.id));
        const uniqueNewPosts = newPosts.filter(post => !existingIds.has(post.id));
        return [...prev, ...uniqueNewPosts];
      });

      if (isLast) setHasMore(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, kw]);

  useEffect(() => {
    if (page > 0 && !hasMore) return;
    fetchPosts();
  }, [page, kw, fetchPosts, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1);
        }
      }, {threshold: 1.0}
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [hasMore, loading]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setPosts([]);
    setHasMore(true);
    setKw(inputText);
  };

  const handleLike = async (e, postId) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다!');
      navigate('/login');
      return;
    }

    try {
      await axios.post(`/api/posts/${postId}/like`, {}, {
        headers: {Authorization: `Bearer ${token}`}
      });

      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          const isLiked = post.voter?.some(v => v.username === currentUser);
          let newVoter = post.voter || [];

          if (isLiked) {
            newVoter = newVoter.filter(v => v.username !== currentUser);
          } else {
            newVoter = [...newVoter, {username: currentUser}];
          }
          return {...post, voter: newVoter};
        }
        return post;
      }));

    } catch (error) {
      console.error(error);
      alert('오류가 발생했습니다.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">최신 글 목록 📝</h2>
          <p className="text-gray-500 mt-1">숲 속의 이야기를 들어보세요.</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="검색어를 입력하세요..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-full md:w-64 transition-all"
          />
          <button type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-sm whitespace-nowrap">
            검색
          </button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {posts.length > 0 ? (
          posts.map(post => {
            const isLiked = post.voter?.some(v => v.username === currentUser);

            return (
              <Link to={`/post/${post.id}`} key={post.id} className="block group">
                <div
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">

                  {/* 썸네일 영역 */}
                  <div className="h-48 overflow-hidden bg-gray-100 relative">
                    {post.filePath ? (
                      // 1. 이미지가 있을 경우
                      <img
                        src={`http://localhost:8080${post.filePath}`}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      // 2. 이미지가 없을 경우
                      <div
                        className="w-full h-full bg-green-50 flex items-center justify-center text-green-200 text-5xl group-hover:bg-green-100 transition-colors">

                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3
                      className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2 group-hover:text-green-700 transition-colors">
                      <span className="line-clamp-1">{post.title}</span>
                      {post.replyList && post.replyList.length > 0 && (
                        <span
                          className="flex-shrink-0 text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                          💬 {post.replyList.length}
                        </span>
                      )}
                    </h3>

                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 h-10">
                      {post.content}
                    </p>

                    <div
                      className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3">
                      <span className="flex items-center gap-1">
                        👤 {post.author ? post.author.username : '익명'}
                      </span>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => handleLike(e, post.id)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full border transition-colors z-10 relative hover:shadow-sm ${
                            isLiked
                              ? 'bg-red-50 border-red-200 text-red-500'
                              : 'bg-white border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400'
                          }`}
                        >
                          <span className="text-xs">{isLiked ? '❤️' : '🤍'}</span>
                          <span className="font-bold text-xs">
                            {post.voter ? post.voter.length : 0}
                          </span>
                        </button>

                        <span>{new Date(post.createDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          !loading && (
            <div className="col-span-2 text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500 text-lg">검색 결과가 없습니다. 🍃</p>
              <button onClick={() => {
                setInputText('');
                setKw('');
                setPage(0);
                setHasMore(true);
              }} className="mt-2 text-green-600 font-medium hover:underline text-sm">
                전체 목록으로 돌아가기
              </button>
            </div>
          )
        )}
      </div>

      {hasMore && (
        <div ref={observerTarget} className="h-20 flex justify-center items-center mt-8 text-gray-400">
          {loading ? '열심히 불러오는 중... 🏃‍♂️' : ''}
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl mt-8">
          모든 이야기를 다 불러왔습니다. 🌲
        </div>
      )}
    </div>
  );
}

export default Home;
