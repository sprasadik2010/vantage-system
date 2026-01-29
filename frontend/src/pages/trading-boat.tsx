import React from 'react'

const TradingBoat: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-gray-100 text-gray-800">
      {/* Trading Boat Section */}
      <section className="text-center px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-4">
          Trading <span className="text-yellow-500">Boat</span>
        </h1>
        <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-6">
          Navigate Forex Markets with Our Automated Trading Vessel.
        </h2>
        <div className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
          <p className="mb-6">
            The Trading Boat is BRANDFX's flagship automated trading system that sails through
            Forex markets 24/5, executing trades based on sophisticated algorithms
            and market analysis.
          </p>
          <ul className="list-disc text-left pl-6 space-y-4 text-gray-800 text-base md:text-lg font-medium">
            <li>
              <span className="font-bold">24/5 Automated Trading</span> – Never miss a trading opportunity
            </li>
            <li>
              <span className="font-bold">Multiple Strategy Options</span> – Conservative, Balanced, and Aggressive modes
            </li>
            <li>
              <span className="font-bold">AI-Powered Analysis</span> – Machine learning market predictions
            </li>
            <li>
              <span className="font-bold">Risk Management</span> – Automated stop-loss and position sizing
            </li>
            <li>
              <span className="font-bold">Real-time Performance Tracking</span> – Monitor your boat's journey live
            </li>
          </ul>
          <p className="mt-8">
            Set sail with confidence. Our Trading Boat navigates market volatility so you can
            focus on growing your portfolio while we handle the technical complexities.
          </p>
        </div>
      </section>
    </div>
  )
}

export default TradingBoat