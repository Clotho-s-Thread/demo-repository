export default function ServerCheckPage() {
  const currentTime = new Date().toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
  });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-gray-900 p-8 rounded-2xl border border-gray-700 shadow-2xl text-center max-w-md w-full">
        {/* 상태 아이콘 */}
        <div className="text-6xl mb-6">🟢</div>

        {/* 타이틀 */}
        <h1 className="text-3xl font-bold text-green-400 mb-2">
          Server is Running!
        </h1>
        <p className="text-gray-400 mb-8">
          Next.js 서버가 정상적으로 작동 중입니다.
        </p>

        {/* 서버 정보 박스 */}
        <div className="bg-gray-800 p-4 rounded-lg text-left space-y-3 font-mono text-sm border border-gray-700">
          <div className="flex justify-between">
            <span className="text-gray-500">Status:</span>
            <span className="text-green-400 font-bold">200 OK</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Port:</span>
            <span className="text-blue-400">3000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Region:</span>
            <span className="text-purple-400">Asia/Seoul (KST)</span>
          </div>
          <div className="border-t border-gray-700 my-2 pt-2">
            <span className="text-gray-500 block mb-1">Server Time:</span>
            <span className="text-yellow-400">{currentTime}</span>
          </div>
        </div>

        {/* 버튼들 */}
        <div className="mt-8 flex gap-3 justify-center">
            <a 
              href="/"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
            >
              🏠 홈으로
            </a>
            <a 
              href="/db-check"
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-blue-100 rounded-lg text-sm transition-colors"
            >
              🗄️ DB 확인
            </a>
        </div>
      </div>
    </div>
  );
}