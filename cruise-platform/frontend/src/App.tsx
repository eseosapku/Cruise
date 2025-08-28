import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import DesktopWrapper from './components/common/DesktopWrapper';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AIAssistant from './pages/AIAssistant';
import LinkedIn from './pages/LinkedIn';
import PitchDeck from './pages/PitchDeck';
import WebScraper from './pages/WebScraper';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import electronService from './services/electron.service';
import './styles/globals.css';
import './styles/glassmorphism.css';

const App: React.FC = () => {
    // Use HashRouter for Electron to avoid routing issues
    const RouterComponent = electronService.isDesktopApp() ? Router : Router;

    return (
        <DesktopWrapper>
            <RouterComponent>
                <div className="min-h-screen flex flex-col bg-gradient-animated">
                    <Header />
                    <main className="flex-1">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/ai-assistant" element={<AIAssistant />} />
                            <Route path="/linkedin" element={<LinkedIn />} />
                            <Route path="/pitch-deck" element={<PitchDeck />} />
                            <Route path="/pitch-deck/:id" element={<PitchDeck />} />
                            <Route path="/web-scraper" element={<WebScraper />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/login" element={<Login />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </RouterComponent>
        </DesktopWrapper>
    );
};

export default App;