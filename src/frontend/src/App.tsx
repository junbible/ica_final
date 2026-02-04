import { useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { MainPage, RestaurantDetail } from "./pages"
import { ChatContainer } from "./components/chat"
import { X } from "lucide-react"

function AppContent() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div className="min-h-screen">
      <Routes>
        <Route
          path="/"
          element={<MainPage onOpenChat={() => setIsChatOpen(true)} />}
        />
        <Route path="/restaurant/:id" element={<RestaurantDetail />} />
        <Route
          path="/chat"
          element={
            <div className="h-screen w-screen bg-gradient-to-br from-[#FFFDF5] via-[#FEF9E7] to-[#FDE68A] flex items-center justify-center p-2 sm:p-4 overflow-hidden">
              <div className="hidden sm:block absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-32 h-32 bg-[#FBBF24]/20 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#F59E0B]/15 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-[#FBBF24]/10 rounded-full blur-2xl" />
              </div>
              <div className="relative z-10 w-full h-full sm:w-auto sm:h-auto">
                <ChatContainer />
              </div>
            </div>
          }
        />
      </Routes>

      {/* 챗봇 모달 오버레이 */}
      {isChatOpen && (
        <div className="fixed inset-0 z-[100]">
          {/* 배경 오버레이 */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsChatOpen(false)}
          />

          {/* 챗봇 컨테이너 */}
          <div className="absolute bottom-0 right-0 sm:bottom-6 sm:right-6 w-full h-[85vh] sm:w-[420px] sm:h-[680px] sm:max-h-[85vh]">
            {/* 닫기 버튼 (모바일) */}
            <button
              onClick={() => setIsChatOpen(false)}
              className="absolute -top-12 right-4 sm:hidden w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <ChatContainer onClose={() => setIsChatOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
