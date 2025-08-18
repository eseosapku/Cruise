import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Dashboard from '../components/modules/Dashboard';
import ChatWindow from '../components/modules/ChatWindow';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('ideation');

  const phases = [
    { id: 'ideation', name: 'Ideation', icon: '💡', description: 'Discover and validate your idea' },
    { id: 'research', name: 'Research', icon: '🔍', description: 'Market analysis and competitor research' },
    { id: 'cofounder', name: 'Co-founder Search', icon: '🤝', description: 'Find the perfect co-founder' },
    { id: 'pitchDeck', name: 'Pitch Deck', icon: '📊', description: 'Create compelling presentations' },
    { id: 'meetings', name: 'Meetings', icon: '🎯', description: 'AI-assisted meeting support' },
    { id: 'product', name: 'Product Development', icon: '🚀', description: 'Build and launch your product' }
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="glass-effect p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-white text-2xl font-bold">Welcome back, {user?.name || 'Entrepreneur'}</h1>
            <p className="text-white text-opacity-70">Your AI-powered entrepreneurship journey</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsChatOpen(true)}
              className="glass-button"
            >
              🤖 AI Assistant
            </button>
            <button
              onClick={handleLogout}
              className="glass-button"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Journey Phases */}
      <div className="glass-effect p-6 mb-6">
        <h2 className="text-white text-xl font-bold mb-4">Your Entrepreneurship Journey</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {phases.map((phase) => (
            <button
              key={phase.id}
              onClick={() => setCurrentPhase(phase.id)}
              className={`glass-card text-center transition-all ${
                currentPhase === phase.id 
                  ? 'bg-white bg-opacity-25 transform scale-105' 
                  : 'hover:bg-white hover:bg-opacity-20'
              }`}
            >
              <div className="text-3xl mb-2">{phase.icon}</div>
              <div className="text-white font-semibold text-sm">{phase.name}</div>
              <div className="text-white text-opacity-70 text-xs mt-1">{phase.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Dashboard Content */}
      <Dashboard currentPhase={currentPhase} />

      {/* AI Chat Window */}
      {isChatOpen && (
        <ChatWindow 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)}
          currentPhase={currentPhase}
        />
      )}
    </div>
  );
};

export default DashboardPage;
