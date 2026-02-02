import { ChatContainer } from "./components/chat"

function App() {
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-[#FFFDF5] via-[#FEF9E7] to-[#FDE68A] flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      {/* 배경 장식 - 모바일에서는 숨김 */}
      <div className="hidden sm:block absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#FBBF24]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#F59E0B]/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-[#FBBF24]/10 rounded-full blur-2xl" />
      </div>

      {/* 챗봇 */}
      <div className="relative z-10 w-full h-full sm:w-auto sm:h-auto">
        <ChatContainer />
      </div>
    </div>
  )
}

export default App
