export enum UserRole {
  HOST = 'HOST',
  CLIENT = 'CLIENT'
}

export type UserRoleOrNull = UserRole | null;

export enum Language {
  ENGLISH = 'EN',
  UKRAINIAN = 'UK',
  GERMAN = 'DE'
}

export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
  PAUSED = 'PAUSED'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole | undefined;
  preferredLanguage?: Language;
}

export interface Session {
  id: string;
  title: string;
  defaultLang: Language;
  isPublic: boolean;
  host?: User;
  participants?: User[];
  createdAt: string;
  updatedAt: string;
}

export interface SessionParticipant {
  id: string;
  sessionId: string;
  userId: string;
  language: Language;
  joinedAt: string;
  leftAt?: string;
}

export interface TranslationHistory {
  id: string;
  sessionId: string;
  userId: string;
  originalText: string;
  translatedText: string;
  sourceLang: Language;
  targetLang: Language;
  timestamp: string;
} 