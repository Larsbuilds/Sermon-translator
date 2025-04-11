import { Request } from 'express';

export type UserRole = 'HOST' | 'CLIENT';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string | null;
  role: UserRole | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: User;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface RegisterBody extends LoginBody {
  name: string;
  role?: UserRole;
}

export interface CreateSessionBody {
  title: string;
  description?: string;
  defaultLang: 'EN' | 'UK' | 'DE';
  isPublic: boolean;
}

export interface JoinSessionBody {
  sessionId: string;
  language: 'EN' | 'UK' | 'DE';
}

export interface TranslationBody {
  text: string;
  sourceLang: 'EN' | 'UK' | 'DE';
  targetLang: 'EN' | 'UK' | 'DE';
  sessionId: string;
} 