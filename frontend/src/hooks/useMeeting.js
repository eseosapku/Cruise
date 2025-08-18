import { useState, useEffect } from 'react';
import apiService from '../services/apiService';

export const useMeeting = (meetingId) => {
  const [meeting, setMeeting] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (meetingId) {
      fetchMeeting(meetingId);
    }
  }, [meetingId]);

  const fetchMeeting = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.get(`/meetings/${id}`);
      setMeeting(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeetings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.get('/meetings');
      setMeetings(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createMeeting = async (meetingData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.post('/meetings', meetingData);
      setMeetings(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateMeeting = async (id, updates) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.put(`/meetings/${id}`, updates);
      setMeeting(response.data);
      setMeetings(prev => prev.map(m => m.id === id ? response.data : m));
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getMeetingAssistance = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.post(`/meetings/${id}/assist`);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    meeting,
    meetings,
    loading,
    error,
    fetchMeeting,
    fetchMeetings,
    createMeeting,
    updateMeeting,
    getMeetingAssistance
  };
};
