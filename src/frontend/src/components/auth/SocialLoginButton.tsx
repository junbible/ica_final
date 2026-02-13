import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SocialLoginButtonProps {
  provider: "kakao"
  onClick: () => void
  className?: string
}

export function SocialLoginButton({ onClick, className }: SocialLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = () => {
    setIsLoading(true)
    onClick()
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "w-full h-12 bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] font-medium disabled:opacity-70",
        className
      )}
    >
      {isLoading ? (
        <div className="w-5 h-5 mr-2 border-2 border-[#191919] border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg
          className="w-5 h-5 mr-2"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 3C6.48 3 2 6.58 2 11c0 2.83 1.85 5.31 4.63 6.72-.2.75-.73 2.72-.84 3.14-.13.52.19.51.4.37.16-.11 2.59-1.76 3.64-2.48.7.1 1.43.15 2.17.15 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
        </svg>
      )}
      {isLoading ? "로그인 중..." : "카카오로 시작하기"}
    </Button>
  )
}
