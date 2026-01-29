import React from 'react'

const WhatWeDo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-gray-100 text-gray-800">
      {/* What We Do Section */}
      <section className="text-center px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-4">
          What <span className="text-yellow-500">We Do</span>
        </h1>
        <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-6">
          Empowering Your Journey in the Forex Market with BRANDFX.
        </h2>
        <div className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
          <p className="mb-6">
            At BRANDFX, we specialize in providing exceptional trading solutions and
            automated tools tailored for both new and seasoned traders. Our
            offerings are designed to elevate your trading experience through practical insights and innovative technology.
          </p>
          <ul className="list-disc text-left pl-6 space-y-4 text-gray-800 text-base md:text-lg font-medium">
            <li>
              <span className="font-bold">Automated Forex Trading</span>
            </li>
            <li>
              <span className="font-bold">USDT Trading & Scalping Strategies</span>
            </li>
            <li>
              <span className="font-bold">Market Analysis & Live Signals</span>
            </li>
            <li>
              <span className="font-bold">5-Level Referral System</span>
            </li>
            <li>
              <span className="font-bold">Trader Education & Community Support</span>
            </li>
          </ul>
          <p className="mt-8">
            Our mission is to simplify forexx trading by delivering accurate market analysis,
            automated strategies, and practical tools that work in real trading conditions.
          </p>
        </div>
      </section>
    </div>
  )
}

export default WhatWeDo