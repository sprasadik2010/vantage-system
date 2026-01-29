import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const Home: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      id: 1,
      title: "Maximize Your Trading Income",
      description: "Join the revolutionary platform that distributes income through a sophisticated 5-level referral system.",
      bgColor: "from-blue-500 to-blue-700"
    },
    {
      id: 2,
      title: "Secure USDT Payments",
      description: "Blockchain-secured transactions with transparent tracking and weekly payouts.",
      bgColor: "from-green-500 to-green-700"
    },
    {
      id: 3,
      title: "Grow Your Network",
      description: "Turn your connections into earnings with our powerful referral system.",
      bgColor: "from-purple-500 to-purple-700"
    }
  ]

  const features = [
    {
      icon: "🔐",
      title: "Secure USDT Payments",
      description: "Blockchain-secured transactions with transparent tracking"
    },
    {
      icon: "📈",
      title: "5-Level Referral System",
      description: "Earn from every level of your expanding network"
    },
    {
      icon: "⚡",
      title: "Instant Payouts",
      description: "Automated weekly withdrawals directly to your wallet"
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [slides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-gray-100 text-gray-800">
      {/* Slider Section at the Top */}
      <div className="relative h-[400px] sm:h-[450px] md:h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <div className="flex h-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide) => (
              <div
                key={slide.id}
                className="w-full flex-shrink-0 h-full"
              >
                <div className={`h-full bg-gradient-to-r ${slide.bgColor}`} />
              </div>
            ))}
          </div>
        </div>
        
        {/* Content Layer - Aligned with navbar */}
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 xs:px-6 sm:px-8 lg:px-12 w-full">
            <div className="text-center text-white max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                {slides[currentSlide].title}
              </h1>
              <p className="text-lg sm:text-xl opacity-90">
                {slides[currentSlide].description}
              </p>
            </div>
          </div>
        </div>

        {/* Slider Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide
                ? 'bg-white w-4'
                : 'bg-white/50 hover:bg-white/70'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Welcome Section */}
      <div className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Welcome to <span className="text-blue-700">BRANDFX</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Community Growth — Earn securely while expanding your trusted network with BRANDFX.
            </p>
            
            {/* Added Paragraph with Matching Symbols */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 sm:p-8 max-w-3xl mx-auto mt-8">
              <div className="text-left space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl text-yellow-600 mt-1">💰</span>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">BrandFX - Gold Trading Algo</h3>
                    <p className="text-gray-700">Fully automates Gold (XAUUSD) trades 24/5 when market is open. No screen time or emotions involved</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl text-green-600 mt-1">💵</span>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">Low Capital Needed</h3>
                    <p className="text-gray-700">Start with just $100 on Cent or Micro accounts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-blue-50 p-8 rounded-xl shadow hover:shadow-lg transition-shadow border border-blue-100"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.icon}{feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home