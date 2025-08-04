// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const colors = {
    deepNavy: '#003049',
    strongBlue: '#006494',
    softBlue: '#669BBC',
    cloudWhite: '#EAEAEA',
    mistGrey: '#CFE0EB'
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled 
          ? 'py-2 shadow-lg' 
          : 'py-4'
      }`}
      style={{ 
        backgroundColor: scrolled ? colors.deepNavy : 'transparent',
        backdropFilter: scrolled ? 'none' : 'blur(10px)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Animated Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden"
                style={{ 
                  background: `linear-gradient(135deg, ${colors.strongBlue} 0%, ${colors.softBlue} 100%)`,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <div 
                    className="w-4 h-4 rounded-full animate-pulse"
                    style={{ backgroundColor: colors.strongBlue }}
                  ></div>
                </div>
              </div>
              <div 
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2"
                style={{ 
                  backgroundColor: colors.softBlue,
                  borderColor: colors.deepNavy
                }}
              ></div>
            </div>
            <div>
              <Link 
                to="/" 
                className="text-2xl font-bold"
                style={{ color: colors.cloudWhite }}
              >
                IoTiva
              </Link>
              <p 
                className="text-xs font-light"
                style={{ color: colors.mistGrey }}
              >
                Connecting the Future
              </p>
            </div>
          </div>

          {/* Animated Connection Indicator (Creative Element) */}
          <div className="hidden md:flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className="w-2 h-2 rounded-full animate-pulse"
                style={{
                  backgroundColor: colors.softBlue,
                  animationDelay: `${i * 0.2}s`,
                  opacity: 0.7
                }}
              ></div>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="focus:outline-none"
              style={{ color: colors.cloudWhite }}
            >
              <svg 
                className={`h-8 w-8 transition-transform duration-300 ${isOpen ? 'transform rotate-90' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div 
          className="md:hidden border-t"
          style={{ 
            backgroundColor: colors.deepNavy,
            borderColor: colors.strongBlue
          }}
        >
          <div 
            className="px-4 py-6 space-y-4"
            style={{ color: colors.cloudWhite }}
          >
            {/* Empty space for future menu items */}
            <div className="text-center py-8 opacity-50">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-12 w-12 mx-auto mb-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                style={{ color: colors.softBlue }}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              </svg>
              <p>Navigation items will appear here</p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;