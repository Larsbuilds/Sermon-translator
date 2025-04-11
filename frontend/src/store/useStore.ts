import { create } from 'zustand';
import { User, Session, Language } from '../types/index';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

interface SessionState {
  currentSession: Session | null;
  selectedLanguage: Language;
  setCurrentSession: (session: Session | null) => void;
  setSelectedLanguage: (language: Language) => void;
}

interface Store extends AuthState, SessionState {}

export const useStore = create<Store>((set) => ({
  // Auth state
  user: null,
  token: null,
  setUser: (user) => {
    set({ user });
  },
  setToken: (token) => {
    set({ token });
    api.setToken(token);
  },
  logout: () => {
    set({ user: null, token: null, currentSession: null });
    api.setToken(null);
  },

  // Session state
  currentSession: null,
  selectedLanguage: Language.ENGLISH,
  setCurrentSession: (session) => set({ currentSession: session }),
  setSelectedLanguage: (language) => set({ selectedLanguage: language }),
})); 