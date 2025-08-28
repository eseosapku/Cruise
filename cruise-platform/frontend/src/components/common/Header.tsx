import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="glassmorphism sticky top-0 z-50 border-b border-white border-opacity-20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link to="/" className="header-logo">
                        🚢 Cruise Platform
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-2">
                        <Link
                            to="/"
                            className={`header-nav-link ${isActive('/') ? 'active' : ''}`}
                        >
                            🏠 Home
                        </Link>
                        <Link
                            to="/dashboard"
                            className={`header-nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                        >
                            📊 Dashboard
                        </Link>
                        <Link
                            to="/pitch-deck"
                            className={`header-nav-link ${isActive('/pitch-deck') ? 'active' : ''}`}
                        >
                            🚀 Pitch Deck
                        </Link>
                        <Link
                            to="/ai-assistant"
                            className={`header-nav-link ${isActive('/ai-assistant') ? 'active' : ''}`}
                        >
                            🧠 AI Assistant
                        </Link>
                        <Link
                            to="/web-scraper"
                            className={`header-nav-link ${isActive('/web-scraper') ? 'active' : ''}`}
                        >
                            🔍 Web Scraper
                        </Link>
                        <Link
                            to="/linkedin"
                            className={`header-nav-link ${isActive('/linkedin') ? 'active' : ''}`}
                        >
                            💼 LinkedIn
                        </Link>
                    </nav>
                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link
                            to="/login"
                            className="header-auth-button login"
                        >
                            Login
                        </Link>
                        <Link
                            to="/profile"
                            className="header-auth-button profile"
                        >
                            👤 Profile
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-3 rounded-xl text-white hover:bg-white hover:bg-opacity-10 transition-all duration-300 transform hover:scale-110"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="mobile-menu md:hidden py-6 border-t border-white border-opacity-20">
                        <nav className="flex flex-col space-y-3">
                            <Link to="/" className="mobile-menu-link" onClick={() => setIsMenuOpen(false)}>🏠 Home</Link>
                            <Link to="/dashboard" className="mobile-menu-link" onClick={() => setIsMenuOpen(false)}>📊 Dashboard</Link>
                            <Link to="/pitch-deck" className="mobile-menu-link" onClick={() => setIsMenuOpen(false)}>🚀 Pitch Deck</Link>
                            <Link to="/ai-assistant" className="mobile-menu-link" onClick={() => setIsMenuOpen(false)}>🧠 AI Assistant</Link>
                            <Link to="/web-scraper" className="mobile-menu-link" onClick={() => setIsMenuOpen(false)}>🔍 Web Scraper</Link>
                            <Link to="/linkedin" className="mobile-menu-link" onClick={() => setIsMenuOpen(false)}>💼 LinkedIn</Link>
                            <hr className="border-white border-opacity-20 my-3" />
                            <Link to="/login" className="mobile-menu-link" onClick={() => setIsMenuOpen(false)}>Login</Link>
                            <Link to="/profile" className="mobile-menu-link" onClick={() => setIsMenuOpen(false)}>👤 Profile</Link>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;