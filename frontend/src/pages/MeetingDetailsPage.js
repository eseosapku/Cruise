import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMeeting } from '../hooks/useMeeting';
import MeetingCard from '../components/modules/MeetingCard';

const MeetingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { meeting, loading, error, fetchMeeting, getMeetingAssistance } = useMeeting(id);
  const [assistance, setAssistance] = useState(null);
  const [loadingAssistance, setLoadingAssistance] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMeeting(id);
    }
  }, [id, fetchMeeting]);

  const handleGetAssistance = async () => {
    setLoadingAssistance(true);
    try {
      const assistanceData = await getMeetingAssistance(id);
      setAssistance(assistanceData);
    } catch (err) {
      console.error('Failed to get meeting assistance:', err);
    } finally {
      setLoadingAssistance(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="glass-effect p-6 text-center">
          <div className="text-white text-xl">Loading meeting details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="glass-effect p-6 text-center">
          <div className="text-red-300 text-xl mb-4">Error: {error}</div>
          <button onClick={() => navigate('/dashboard')} className="glass-button">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="glass-effect p-6 text-center">
          <div className="text-white text-xl mb-4">Meeting not found</div>
          <button onClick={() => navigate('/dashboard')} className="glass-button">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="glass-effect p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-white text-opacity-70 hover:text-opacity-100 mb-2"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-white text-2xl font-bold">{meeting.title}</h1>
            <p className="text-white text-opacity-70">{meeting.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleGetAssistance}
              disabled={loadingAssistance}
              className="glass-button disabled:opacity-50"
            >
              {loadingAssistance ? 'Generating...' : '🤖 Get AI Assistance'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meeting Details */}
        <div className="glass-effect p-6">
          <h2 className="text-white text-xl font-bold mb-4">Meeting Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-white text-opacity-70 text-sm">Date & Time</label>
              <div className="text-white">
                {new Date(meeting.meeting_date).toLocaleString()}
              </div>
            </div>

            <div>
              <label className="text-white text-opacity-70 text-sm">Duration</label>
              <div className="text-white">{meeting.duration} minutes</div>
            </div>

            <div>
              <label className="text-white text-opacity-70 text-sm">Participants</label>
              <div className="text-white">
                {meeting.participants?.map((participant, index) => (
                  <span key={index} className="inline-block bg-white bg-opacity-20 rounded-full px-3 py-1 text-sm mr-2 mb-2">
                    {participant}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="text-white text-opacity-70 text-sm">Agenda</label>
              <div className="text-white whitespace-pre-wrap">{meeting.agenda}</div>
            </div>

            {meeting.notes && (
              <div>
                <label className="text-white text-opacity-70 text-sm">Notes</label>
                <div className="text-white whitespace-pre-wrap">{meeting.notes}</div>
              </div>
            )}
          </div>
        </div>

        {/* AI Assistance */}
        <div className="glass-effect p-6">
          <h2 className="text-white text-xl font-bold mb-4">AI Meeting Assistance</h2>
          
          {assistance ? (
            <div className="space-y-4">
              {assistance.suggestions && (
                <div>
                  <h3 className="text-white font-semibold mb-2">💡 Suggestions</h3>
                  <div className="text-white text-opacity-90 text-sm">
                    {assistance.suggestions}
                  </div>
                </div>
              )}

              {assistance.talking_points && (
                <div>
                  <h3 className="text-white font-semibold mb-2">🎯 Key Talking Points</h3>
                  <div className="text-white text-opacity-90 text-sm">
                    {assistance.talking_points}
                  </div>
                </div>
              )}

              {assistance.questions && (
                <div>
                  <h3 className="text-white font-semibold mb-2">❓ Recommended Questions</h3>
                  <div className="text-white text-opacity-90 text-sm">
                    {assistance.questions}
                  </div>
                </div>
              )}

              {assistance.follow_up_actions && (
                <div>
                  <h3 className="text-white font-semibold mb-2">📋 Follow-up Actions</h3>
                  <div className="text-white text-opacity-90 text-sm">
                    {assistance.follow_up_actions}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-white text-opacity-70">
              <div className="text-6xl mb-4">🤖</div>
              <p>Click "Get AI Assistance" to receive personalized meeting support, talking points, and strategic recommendations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingDetailsPage;
