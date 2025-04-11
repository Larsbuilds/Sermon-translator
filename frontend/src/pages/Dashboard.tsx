import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { CreateSessionModal } from '../components/CreateSessionModal';
import { api } from '../services/api';
import { Session, UserRole, UserRoleOrNull, Language } from '../types';

interface CreateSessionData {
  title: string;
  defaultLang: Language;
  isPublic: boolean;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, setUser, logout, setCurrentSession } = useStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const data = await api.getSessions();
      setSessions(data);
    } catch (err) {
      setError('Failed to fetch sessions. Please try again.');
      console.error('Error fetching sessions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSession = async (sessionData: CreateSessionData) => {
    try {
      const session = await api.createSession(sessionData);
      if (session) {
        setCurrentSession(session);
        await api.updateUserRole('HOST' as UserRole);
        navigate(`/session/${session.id}`);
      }
    } catch (error) {
      console.error('Error creating session:', error);
      const nullRole: UserRoleOrNull = null;
      await api.updateUserRole(nullRole);
    }
  };

  const handleJoinSession = async (sessionId: string, language: Language) => {
    try {
      // First set role to NULL
      await api.updateUserRole(null);
      
      // Then join the session
      const session = await api.joinSession(sessionId, language);
      if (session) {
        setCurrentSession(session);
        // Finally set role to CLIENT
        await api.updateUserRole('CLIENT' as UserRole);
        navigate(`/session/${session.id}`);
      }
    } catch (error) {
      console.error('Error joining session:', error);
      // Reset role to NULL in case of error
      await api.updateUserRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Active Sessions</h1>
            <button
              className="btn btn-primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create New Session
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center">
              <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg mb-4">No active sessions available</p>
              <button
                className="btn btn-primary"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create Your First Session
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map((session) => (
                <div key={session.id} className="card bg-base-200 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title">{session.title}</h2>
                    <p>Host: {session.host?.name || 'Unknown'}</p>
                    <p>Language: {session.defaultLang}</p>
                    <p>Status: {session.isPublic ? 'Public' : 'Private'}</p>
                    <p>Participants: {session.participants?.length || 0}</p>
                    <div className="card-actions justify-end">
                      <button
                        onClick={() => handleJoinSession(session.id, session.defaultLang)}
                        className="btn btn-primary"
                      >
                        Join Session
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateSessionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSession={handleCreateSession}
      />
    </div>
  );
} 