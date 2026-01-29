import React from 'react'

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-gray-100 text-gray-800">
      {/* About Section */}
      <section className="text-center px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-4">
          About <span className="text-yellow-500">BRANDFX</span>
        </h1>
        <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-6">
          Welcome to BRANDFX – Your Trusted Partner in Forex Trading.
        </h2>
        <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
          At BRANDFX, we are committed to empowering traders across the globe with the tools,
          insights, and support they need to succeed in the dynamic world of forex trading.
          Whether you're a beginner looking to step into the markets or an experienced trader
          seeking an edge, BRANDFX offers a trusted platform designed to help you achieve your goals.
        </p>
      </section>
    </div>
  )
}

export default About