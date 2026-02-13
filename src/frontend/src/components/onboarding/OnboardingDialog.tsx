import { useState } from "react"
import { MapPin, Sparkles, ChefHat, Navigation } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useGeolocation } from "@/hooks/useGeolocation"

interface OnboardingDialogProps {
  open: boolean
  onComplete: () => void
}

type Step = "welcome" | "location" | "complete"

export function OnboardingDialog({ open, onComplete }: OnboardingDialogProps) {
  const [step, setStep] = useState<Step>("welcome")
  const { status, requestLocation, isSupported } = useGeolocation()

  const handleLocationRequest = async () => {
    await requestLocation()
    setStep("complete")
  }

  const handleSkipLocation = () => {
    setStep("complete")
  }

  const handleComplete = () => {
    onComplete()
  }

  return (
    <Dialog open={open}>
      <DialogContent
        hideCloseButton
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {step === "welcome" && (
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-20 h-20 mb-4">
              <img
                src="/logo.png"
                alt="nyam! logo"
                className="w-full h-full object-contain"
              />
            </div>
            <DialogHeader className="items-center">
              <DialogTitle className="text-2xl font-logo text-primary">
                nyam!
              </DialogTitle>
              <DialogDescription className="text-base mt-2 text-center">
                컨디션 맞춤 맛집 추천 서비스
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-4 w-full">
              <div className="text-center p-3 bg-secondary/50 rounded-lg">
                <ChefHat className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="font-medium text-sm">AI 맞춤 추천</p>
                <p className="text-xs text-muted-foreground">
                  오늘 컨디션에 딱 맞는 메뉴를 추천해드려요
                </p>
              </div>

              <div className="text-center p-3 bg-secondary/50 rounded-lg">
                <MapPin className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="font-medium text-sm">내 주변 맛집</p>
                <p className="text-xs text-muted-foreground">
                  위치 기반으로 가까운 맛집을 찾아드려요
                </p>
              </div>

              <div className="text-center p-3 bg-secondary/50 rounded-lg">
                <Sparkles className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="font-medium text-sm">테마 컬렉션</p>
                <p className="text-xs text-muted-foreground">
                  해장, 데이트, 혼밥 등 상황별 맛집 모음
                </p>
              </div>
            </div>

            <Button
              className="w-full mt-6"
              size="lg"
              onClick={() => setStep("location")}
            >
              시작하기
            </Button>
          </div>
        )}

        {step === "location" && (
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Navigation className="w-8 h-8 text-primary" />
            </div>
            <DialogHeader className="items-center">
              <DialogTitle className="text-xl">
                위치 권한이 필요해요
              </DialogTitle>
              <DialogDescription className="text-base mt-2 text-center">
                내 주변 맛집을 찾으려면<br />
                위치 정보 접근을 허용해주세요
              </DialogDescription>
            </DialogHeader>

            {!isSupported && (
              <p className="text-sm text-destructive mt-4">
                이 브라우저는 위치 서비스를 지원하지 않습니다
              </p>
            )}

            {status === "denied" && (
              <p className="text-sm text-destructive mt-4">
                위치 권한이 거부되었습니다.<br />
                브라우저 설정에서 권한을 허용해주세요.
              </p>
            )}

            <div className="w-full mt-6 space-y-2">
              <Button
                className="w-full"
                size="lg"
                onClick={handleLocationRequest}
                disabled={status === "requesting"}
              >
                {status === "requesting" ? (
                  <>
                    <span className="animate-spin mr-2">
                      <Navigation className="w-4 h-4" />
                    </span>
                    위치 확인 중...
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 mr-2" />
                    위치 허용하기
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={handleSkipLocation}
              >
                나중에 할게요
              </Button>
            </div>
          </div>
        )}

        {step === "complete" && (
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-green-600" />
            </div>
            <DialogHeader className="items-center">
              <DialogTitle className="text-xl">
                준비 완료!
              </DialogTitle>
              <DialogDescription className="text-base mt-2 text-center">
                이제 nyam!과 함께<br />
                맛있는 한 끼를 찾아보세요
              </DialogDescription>
            </DialogHeader>

            <Button
              className="w-full mt-6"
              size="lg"
              onClick={handleComplete}
            >
              맛집 찾으러 가기
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
