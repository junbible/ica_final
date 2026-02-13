import { useState, Component, type ReactNode, type ErrorInfo } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { MainPage, RestaurantDetail, MyPage } from "./pages"
import { ChatContainer } from "./components/chat"
import { OnboardingDialog } from "./components/onboarding/OnboardingDialog"
import { useOnboarding } from "./hooks/useOnboarding"
import { AuthProvider } from "./contexts/AuthContext"
import { FavoritesProvider } from "./contexts/FavoritesContext"
import { ToastProvider } from "./components/ui/toast"
import { X } from "lucide-react"

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("React Error:", error, info) }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center max-w-md">
            <p className="text-6xl mb-4">😵</p>
            <h2 className="text-lg font-bold mb-2">앗, 문제가 발생했어요</h2>
            <p className="text-sm text-gray-500 mb-4">{this.state.error.message}</p>
            <button onClick={() => { this.setState({ error: null }); window.location.href = "/" }} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm">홈으로 돌아가기</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function AppContent() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const { hasCompletedOnboarding, completeOnboarding } = useOnboarding()

  return (
    <div className="min-h-screen">
      {/* 온보딩 다이얼로그 */}
      <OnboardingDialog
        open={!hasCompletedOnboarding}
        onComplete={completeOnboarding}
      />
      <Routes>
        <Route
          path="/"
          element={<MainPage onOpenChat={() => setIsChatOpen(true)} />}
        />
        <Route path="/restaurant/:id" element={<RestaurantDetail />} />
        <Route path="/mypage" element={<MyPage />} />
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
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <FavoritesProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </FavoritesProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
