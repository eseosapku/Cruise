import React from 'react';

const MeetingCard = ({ meeting, onClick }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500';
      case 'in-progress':
        return 'bg-green-500';
      case 'completed':
        return 'bg-gray-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const isUpcoming = new Date(meeting.meeting_date) > new Date();

  return (
    <div 
      onClick={onClick}
      className="glass-card cursor-pointer hover:transform hover:scale-105 transition-all duration-200"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-white font-semibold text-lg truncate">{meeting.title}</h3>
        <div className={`w-3 h-3 rounded-full ${getStatusColor(meeting.status)}`}></div>
      </div>

      {/* Description */}
      {meeting.description && (
        <p className="text-white text-opacity-70 text-sm mb-3 line-clamp-2">
          {meeting.description}
        </p>
      )}

      {/* Meeting Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-white text-opacity-80 text-sm">
          <span className="mr-2">📅</span>
          <span>{formatDate(meeting.meeting_date)}</span>
        </div>
        
        <div className="flex items-center text-white text-opacity-80 text-sm">
          <span className="mr-2">⏱️</span>
          <span>{meeting.duration} minutes</span>
        </div>

        {meeting.participants && meeting.participants.length > 0 && (
          <div className="flex items-center text-white text-opacity-80 text-sm">
            <span className="mr-2">👥</span>
            <span>{meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Participants */}
      {meeting.participants && meeting.participants.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {meeting.participants.slice(0, 3).map((participant, index) => (
              <span 
                key={index}
                className="bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded-full"
              >
                {participant}
              </span>
            ))}
            {meeting.participants.length > 3 && (
              <span className="bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded-full">
                +{meeting.participants.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Status and Actions */}
      <div className="flex justify-between items-center">
        <span className={`text-xs px-2 py-1 rounded-full ${
          isUpcoming 
            ? 'bg-green-500 bg-opacity-20 text-green-300' 
            : 'bg-gray-500 bg-opacity-20 text-gray-300'
        }`}>
          {isUpcoming ? 'Upcoming' : 'Past'}
        </span>

        {meeting.ai_assistance && Object.keys(meeting.ai_assistance).length > 0 && (
          <span className="text-xs bg-purple-500 bg-opacity-20 text-purple-300 px-2 py-1 rounded-full">
            🤖 AI Ready
          </span>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-3 pt-3 border-t border-white border-opacity-20">
        <div className="flex justify-between text-white text-opacity-60 text-xs">
          <span>Click for details</span>
          {isUpcoming && (
            <span className="text-blue-300">🎯 Get AI assistance</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingCard;
