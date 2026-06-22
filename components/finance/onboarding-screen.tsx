"use client"

import { ArrowRight } from "lucide-react"

interface OnboardingScreenProps {
  onComplete: () => void
  currentSlide: number
  onSlideChange: (n: number) => void
}

const slides = [
  {
    headline: "All Your Finances. One Powerful Platform.",
    description:
      "Send, receive, and manage your money effortlessly fast, secure, and designed for everyday life.",
  },
  {
    headline: "Smart Tracking. Smarter Decisions.",
    description:
      "Visualize your spending, monitor income, and stay on top of every transaction with beautiful insights.",
  },
  {
    headline: "Send Money in Seconds.",
    description:
      "Instant transfers to friends and family. No fees, no fuss — just seamless payments at your fingertips.",
  },
]

export function OnboardingScreen({ onComplete, currentSlide, onSlideChange }: OnboardingScreenProps) {
  const slide = slides[currentSlide] ?? slides[0]
  const isLast = currentSlide === slides.length - 1

  const handleNext = () => {
    if (isLast) {
      onComplete()
    } else {
      onSlideChange(currentSlide + 1)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden select-none">
      {/* Hero Image */}
      <div className="relative flex-1 min-h-0">
        <img
          src="/images/onboarding-hero.jpg"
          alt="Woman confidently managing finances on her smartphone"
          className="w-full h-full object-cover object-top"
          draggable={false}
        />
      </div>

      {/* Content */}
      <div className="px-7 pt-6 pb-8 flex flex-col gap-4">
        <div className="text-center space-y-2">
          <h1 className="text-[22px] font-bold leading-tight text-forest text-balance">
            {slide.headline}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {slide.description}
          </p>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 py-1">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => onSlideChange(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentSlide ? "w-5 bg-forest" : "w-2 bg-forest/20"
              }`}
            />
          ))}
        </div>

        {/* Button */}
        <button
          onClick={handleNext}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-forest text-white font-semibold text-base transition-all active:scale-[0.98]"
        >
          {isLast ? "Get Started" : "Next"}
          <ArrowRight size={18} />
        </button>

      </div>
    </div>
  )
}
