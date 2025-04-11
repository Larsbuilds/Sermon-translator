import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Session } from '../types/index';

export const SessionList = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/sessions');
        if (!response.ok) {
          throw new Error('Failed to fetch sessions');
        }
        const data = await response.json();
        setSessions(data);
      } catch (err) {
        setError('Failed to load sessions. Please try again later.');
        console.error('Error fetching sessions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg">No sessions found. Create a new session to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sessions.map((session) => (
        <div key={session.id} className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">{session.title}</h2>
            <p>Default Language: {session.defaultLang}</p>
            <p>Status: {session.isPublic ? 'Public' : 'Private'}</p>
            {session.host && (
              <p>Host: {session.host.name || session.host.email}</p>
            )}
            <div className="card-actions justify-end mt-4">
              <Link to={`/session/${session.id}`} className="btn btn-primary">
                Join Session
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 