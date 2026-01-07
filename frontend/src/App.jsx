import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
        <Navbar/>

        <main className="flex-grow pt-24 pb-10 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/post/:id" element={<PostDetail/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/signup" element={<Signup/>}/>
          </Routes>
        </main>

        <Footer/>
      </div>
    </BrowserRouter>
  );
}

export default App
