import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { SocialLoginButton } from "./SocialLoginButton"
import { getKakaoLoginUrl, getGoogleLoginUrl } from "@/lib/auth"

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const handleKakaoLogin = () => {
    window.location.href = getKakaoLoginUrl()
  }

  const handleGoogleLogin = () => {
    window.location.href = getGoogleLoginUrl()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-16 h-16 mb-4">
            <img
              src="/logo.png"
              alt="nyam! logo"
              className="w-full h-full object-contain"
            />
          </div>

          <DialogHeader className="items-center">
            <DialogTitle className="text-xl font-logo text-primary">
              nyam! 로그인
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              로그인하면 맞춤 추천과<br />
              즐겨찾기 기능을 이용할 수 있어요
            </DialogDescription>
          </DialogHeader>

          <div className="w-full mt-6 space-y-3">
            <SocialLoginButton
              provider="kakao"
              onClick={handleKakaoLogin}
            />
            <SocialLoginButton
              provider="google"
              onClick={handleGoogleLogin}
            />
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            로그인 시 <span className="underline">이용약관</span> 및{" "}
            <span className="underline">개인정보처리방침</span>에 동의하게 됩니다
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
