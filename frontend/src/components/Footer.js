import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-900 text-white">
      <div className="section-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company */}
          <div>
            <h3 className="font-bold text-lg mb-4">EventEase</h3>
            <p className="text-primary-200 text-sm">
              Premium event management platform for organizing and attending
              amazing events.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-200">
              <li>
                <a href="/" className="hover:text-white transition">
                  Home
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-white transition">
                  Browse Events
                </a>
              </li>
              <li>
                <a href="/register" className="hover:text-white transition">
                  Sign Up
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-primary-200">
              <li>
                <button className="hover:text-white transition text-left">
                  Help Center
                </button>
              </li>
              <li>
                <button className="hover:text-white transition text-left">
                  Contact Us
                </button>
              </li>
              <li>
                <button className="hover:text-white transition text-left">
                  FAQs
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-primary-200">
              <li>
                <button className="hover:text-white transition text-left">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button className="hover:text-white transition text-left">
                  Terms of Service
                </button>
              </li>
              <li>
                <button className="hover:text-white transition text-left">
                  Cookie Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-primary-200 text-sm">
              © {currentYear} EventEase. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <button
                className="text-primary-200 hover:text-white transition"
                aria-label="Twitter"
              >
                Twitter
              </button>
              <button
                className="text-primary-200 hover:text-white transition"
                aria-label="LinkedIn"
              >
                LinkedIn
              </button>
              <button
                className="text-primary-200 hover:text-white transition"
                aria-label="Instagram"
              >
                Instagram
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
