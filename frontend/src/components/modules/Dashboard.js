import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MeetingCard from './MeetingCard';
import apiService from '../../services/apiService';

const Dashboard = ({ currentPhase }) => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    meetings: [],
    ideas: [],
    research: [],
    outreach: [],
    pitchDecks: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load different data based on current phase
      switch (currentPhase) {
        case 'meetings':
          await loadMeetings();
          break;
        case 'research':
          await loadResearch();
          break;
        case 'cofounder':
          await loadOutreach();
          break;
        case 'pitchDeck':
          await loadPitchDecks();
          break;
        default:
          await loadOverview();
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMeetings = async () => {
    try {
      const response = await apiService.get('/meetings');
      setData(prev => ({ ...prev, meetings: response.data }));
    } catch (error) {
      console.error('Failed to load meetings:', error);
    }
  };

  const loadResearch = async () => {
    try {
      const response = await apiService.get('/research/market-insights');
      setData(prev => ({ ...prev, research: response.data }));
    } catch (error) {
      console.error('Failed to load research:', error);
    }
  };

  const loadOutreach = async () => {
    try {
      const response = await apiService.get('/outreach/find-cofounders');
      setData(prev => ({ ...prev, outreach: response.data }));
    } catch (error) {
      console.error('Failed to load outreach:', error);
    }
  };

  const loadPitchDecks = async () => {
    try {
      const response = await apiService.get('/pitch-deck/templates');
      setData(prev => ({ ...prev, pitchDecks: response.data }));
    } catch (error) {
      console.error('Failed to load pitch decks:', error);
    }
  };

  const loadOverview = async () => {
    // Load a summary of all data for overview
    await Promise.all([
      loadMeetings(),
      loadResearch(),
      loadOutreach(),
      loadPitchDecks()
    ]);
  };

  const renderPhaseContent = () => {
    switch (currentPhase) {
      case 'ideation':
        return renderIdeationPhase();
      case 'research':
        return renderResearchPhase();
      case 'cofounder':
        return renderCofounderPhase();
      case 'pitchDeck':
        return renderPitchDeckPhase();
      case 'meetings':
        return renderMeetingsPhase();
      case 'product':
        return renderProductPhase();
      default:
        return renderOverview();
    }
  };

  const renderIdeationPhase = () => (
    <div className="space-y-6">
      <div className="glass-effect p-6">
        <h2 className="text-white text-xl font-bold mb-4">💡 Ideation Hub</h2>
        <p className="text-white text-opacity-80 mb-6">
          Let's start your entrepreneurial journey by exploring and validating your ideas.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="glass-card text-left">
            <h3 className="text-white font-semibold mb-2">🔍 Market Research</h3>
            <p className="text-white text-opacity-70 text-sm">
              Discover market opportunities and validate your ideas with AI-powered research.
            </p>
          </button>
          
          <button className="glass-card text-left">
            <h3 className="text-white font-semibold mb-2">💬 AI Brainstorming</h3>
            <p className="text-white text-opacity-70 text-sm">
              Collaborate with AI to refine and expand your business concepts.
            </p>
          </button>
          
          <button className="glass-card text-left">
            <h3 className="text-white font-semibold mb-2">📊 Idea Validation</h3>
            <p className="text-white text-opacity-70 text-sm">
              Get detailed analysis and feedback on your business ideas.
            </p>
          </button>
          
          <button className="glass-card text-left">
            <h3 className="text-white font-semibold mb-2">🎯 Target Audience</h3>
            <p className="text-white text-opacity-70 text-sm">
              Identify and understand your ideal customers.
            </p>
          </button>
        </div>
      </div>
    </div>
  );

  const renderResearchPhase = () => (
    <div className="space-y-6">
      <div className="glass-effect p-6">
        <h2 className="text-white text-xl font-bold mb-4">🔍 Research & Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="glass-card text-left">
            <h3 className="text-white font-semibold mb-2">📈 Market Analysis</h3>
            <p className="text-white text-opacity-70 text-sm">
              Comprehensive market size and growth analysis
            </p>
          </button>
          
          <button className="glass-card text-left">
            <h3 className="text-white font-semibold mb-2">🏢 Competitor Research</h3>
            <p className="text-white text-opacity-70 text-sm">
              Analyze competitors and find market gaps
            </p>
          </button>
          
          <button className="glass-card text-left">
            <h3 className="text-white font-semibold mb-2">📊 Industry Trends</h3>
            <p className="text-white text-opacity-70 text-sm">
              Stay updated with latest industry insights
            </p>
          </button>
        </div>
      </div>
    </div>
  );

  const renderCofounderPhase = () => (
    <div className="space-y-6">
      <div className="glass-effect p-6">
        <h2 className="text-white text-xl font-bold mb-4">🤝 Co-founder Search</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="glass-card text-left">
            <h3 className="text-white font-semibold mb-2">🔍 Find Candidates</h3>
            <p className="text-white text-opacity-70 text-sm">
              AI-powered LinkedIn search for potential co-founders
            </p>
          </button>
          
          <button className="glass-card text-left">
            <h3 className="text-white font-semibold mb-2">💌 Outreach Campaign</h3>
            <p className="text-white text-opacity-70 text-sm">
              Automated personalized outreach messages
            </p>
          </button>
        </div>
      </div>
    </div>
  );

  const renderPitchDeckPhase = () => (
    <div className="space-y-6">
      <div className="glass-effect p-6">
        <h2 className="text-white text-xl font-bold mb-4">📊 Pitch Deck Builder</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.pitchDecks.map((template, index) => (
            <button key={index} className="glass-card text-left">
              <h3 className="text-white font-semibold mb-2">{template.name}</h3>
              <p className="text-white text-opacity-70 text-sm">{template.description}</p>
              <div className="text-white text-opacity-50 text-xs mt-2">
                {template.slides} slides • {template.category}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMeetingsPhase = () => (
    <div className="space-y-6">
      <div className="glass-effect p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl font-bold">🎯 Meetings & Support</h2>
          <button className="glass-button">+ New Meeting</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.meetings.map((meeting) => (
            <MeetingCard 
              key={meeting.id} 
              meeting={meeting} 
              onClick={() => navigate(`/meetings/${meeting.id}`)}
            />
          ))}
          
          {data.meetings.length === 0 && (
            <div className="col-span-full text-center text-white text-opacity-70">
              No meetings yet. Create your first meeting to get AI assistance!
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderProductPhase = () => (
    <div className="space-y-6">
      <div className="glass-effect p-6">
        <h2 className="text-white text-xl font-bold mb-4">🚀 Product Development</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="glass-card text-left">
            <h3 className="text-white font-semibold mb-2">📋 Product Roadmap</h3>
            <p className="text-white text-opacity-70 text-sm">
              AI-generated development roadmap based on your research
            </p>
          </button>
          
          <button className="glass-card text-left">
            <h3 className="text-white font-semibold mb-2">🎨 MVP Planning</h3>
            <p className="text-white text-opacity-70 text-sm">
              Define and plan your minimum viable product
            </p>
          </button>
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card text-center">
          <div className="text-3xl mb-2">💡</div>
          <div className="text-white font-semibold">Ideas</div>
          <div className="text-white text-opacity-70">{data.ideas.length || 0}</div>
        </div>
        
        <div className="glass-card text-center">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-white font-semibold">Meetings</div>
          <div className="text-white text-opacity-70">{data.meetings.length || 0}</div>
        </div>
        
        <div className="glass-card text-center">
          <div className="text-3xl mb-2">🤝</div>
          <div className="text-white font-semibold">Outreach</div>
          <div className="text-white text-opacity-70">{data.outreach.length || 0}</div>
        </div>
        
        <div className="glass-card text-center">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-white font-semibold">Pitch Decks</div>
          <div className="text-white text-opacity-70">{data.pitchDecks.length || 0}</div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="glass-effect p-6 text-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      {renderPhaseContent()}
    </div>
  );
};

export default Dashboard;
