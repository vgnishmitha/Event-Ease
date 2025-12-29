import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B061F] flex items-center justify-center px-6">
      {/* Background glow effects */}
      <div className="absolute top-[-120px] left-[-120px] w-[420px] h-[420px] bg-purple-600/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[420px] h-[420px] bg-indigo-600/30 rounded-full blur-[120px]" />

      {/* Glass Card */}
      <div className="relative z-10 max-w-5xl w-full rounded-[36px] backdrop-blur-2xl">
        <div className="px-10 py-20 md:px-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-sm text-purple-300 border border-white/10">
            ✨ Premium Event Management Platform
          </div>

          {/* Heading */}
          <h1 className="mt-8 text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Experience Events <br />
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Like Never Before
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
            EventEase empowers organizers and attendees with seamless event
            creation, discovery, and management — crafted with elegance, speed,
            and reliability.
          </p>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="group relative inline-flex items-center justify-center px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-purple-500/40"
            >
              Get Started
              <span className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition" />
            </Link>

            <Link
              to="/home"
              className="inline-flex items-center justify-center px-7 py-4 rounded-full border border-white/20 text-gray-200 backdrop-blur hover:bg-white/10 transition-all duration-300"
            >
              Explore Events
            </Link>
          </div>

          {/* Trust text */}
          <p className="mt-10 text-sm text-gray-400">
            Trusted by organizers, creators & communities worldwide.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
