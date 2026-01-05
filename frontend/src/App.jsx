import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
    // 게시글 데이터를 담을 공간 (초기값은 빈 리스트 [])
    const [posts, setPosts] = useState([]);

    // 화면이 켜지자마자 실행되는 함수
    useEffect(() => {
        // 1. 스프링부트 API 호출 (/api/posts)
        axios.get('/api/posts')
            .then(response => {
                // 2. 가져온 데이터 확인
                console.log("가져온 데이터:", response.data);

                // 3. state에 저장 (Page객체의 content 안에 실제 리스트가 있음)
                setPosts(response.data.content);
            })
            .catch(error => {
                console.error("에러 발생:", error);
            });
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>🌲 참나무 숲 🌲</h1>
            <h2>글 목록</h2>

            <hr />

            {posts.map(post => (
                <div key={post.id} style={{ borderBottom: '1px solid #ccc', padding: '10px' }}>
                    <h3>📄 {post.title}</h3>
                    <p>{post.content}</p>
                    <small>작성자: {post.author.username} | 조회수: {post.view}</small>
                </div>
            ))}
        </div>
    )
}

export default App
