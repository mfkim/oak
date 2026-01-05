import {useState, useEffect} from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';

function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get('/api/posts')
      .then(res => setPosts(res.data.content))
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
              <div
                className="h-32 bg-green-50 flex items-center justify-center text-green-200 text-4xl group-hover:bg-green-100 transition-colors">
                🌳
              </div>
              <div className="p-5">
                <h3
                  className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-green-700 transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2 h-10">
                  {post.content}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3">
                  <span className="flex items-center gap-1">
                    👤 {post.author.username}
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
