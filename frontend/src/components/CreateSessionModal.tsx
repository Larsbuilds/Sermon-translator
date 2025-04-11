import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Language } from '../types/index';

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSession: (data: {
    title: string;
    defaultLang: Language;
    isPublic: boolean;
  }) => Promise<void>;
}

export const CreateSessionModal = ({
  isOpen,
  onClose,
  onCreateSession,
}: CreateSessionModalProps) => {
  const [title, setTitle] = useState('');
  const [defaultLang, setDefaultLang] = useState<Language>(Language.ENGLISH);
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onCreateSession({
        title,
        defaultLang,
        isPublic,
      });
      onClose();
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Create New Session</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Session Title</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">Default Language</span>
            </label>
            <select
              className="select select-bordered"
              value={defaultLang}
              onChange={(e) => setDefaultLang(e.target.value as Language)}
              required
            >
              <option value={Language.ENGLISH}>English</option>
              <option value={Language.UKRAINIAN}>Ukrainian</option>
              <option value={Language.GERMAN}>German</option>
            </select>
          </div>

          <div className="form-control mt-4">
            <label className="label cursor-pointer">
              <span className="label-text">Public Session</span>
              <input
                type="checkbox"
                className="toggle"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
            </label>
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 