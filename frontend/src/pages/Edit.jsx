import {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import axios from 'axios';

function Edit() {
  const {id} = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const [currentImage, setCurrentImage] = useState(null); // 기존 이미지 경로
  const [file, setFile] = useState(null); // 새로 올릴 파일

  // ★ 1. 이미지 삭제 여부 상태 추가
  const [isImageDeleted, setIsImageDeleted] = useState(false);

  // 기존 데이터 불러오기
  useEffect(() => {
    axios.get(`/api/posts/${id}`)
      .then(res => {
        setTitle(res.data.title);
        setContent(res.data.content);
        setCurrentImage(res.data.filePath);
      })
      .catch(err => {
        console.error(err);
        alert('글을 불러오는데 실패했습니다.');
        navigate(-1);
      });
  }, [id, navigate]);

  // 새 파일 선택 핸들러
  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setIsImageDeleted(false); // ★ 새 파일을 선택하면 삭제 취소
    }
  };

  // ★ 2. 이미지 삭제 핸들러
  const handleDeleteImage = () => {
    setCurrentImage(null);   // 화면에서 미리보기 제거
    setFile(null);           // 선택된 파일 제거
    setIsImageDeleted(true); // 삭제 플래그 설정
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);

    // ★ 3. 이미지 삭제 여부 전송
    formData.append('isImageDeleted', isImageDeleted);

    // 새 파일이 선택되었을 때만 추가
    if (file) {
      formData.append('file', file);
    }

    try {
      // 수정 요청 (PUT)
      await axios.put(`/api/posts/${id}`, formData, {
        headers: {Authorization: `Bearer ${token}`}
      });

      alert('수정이 완료되었습니다! ✨');
      navigate(`/post/${id}`);
    } catch (error) {
      console.error(error);
      alert('수정에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">글 수정하기 ✏️</h2>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none h-64 resize-none"
              required
            />
          </div>

          {/* 이미지 수정 UI (삭제 버튼 포함) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">이미지 수정</label>

            {/* 기존 이미지가 있고, 새 파일은 선택 안 했을 때 */}
            {currentImage && !file && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={`http://localhost:8080${currentImage}`}
                    alt="Current"
                    className="h-20 w-20 object-cover rounded-md"
                  />
                  <span className="text-sm text-gray-500">현재 등록된 이미지</span>
                </div>
                {/* 삭제 버튼 */}
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors"
                >
                  🗑️ 이미지 삭제
                </button>
              </div>
            )}

            {/* 이미지가 없거나(삭제됨), 원래 없던 경우 */}
            {(!currentImage && !file) && (
              <div className="mb-3 text-sm text-gray-400 p-2 bg-gray-50 rounded border border-dashed border-gray-300">
                현재 등록된 이미지가 없습니다. (이미지 없이 저장됩니다)
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition-colors cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-1 ml-1">
              * 새 이미지를 선택하면 기존 이미지는 교체됩니다.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-lg text-gray-600 hover:bg-gray-100 font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold shadow-md"
            >
              수정 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Edit;
