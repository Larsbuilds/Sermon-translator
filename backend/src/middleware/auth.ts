import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const auth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('Auth middleware - Headers:', req.headers);
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Auth middleware - Token:', token);

    if (!token) {
      console.log('Auth middleware - No token provided');
      res.status(401).json({ error: 'Please authenticate.' });
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      console.log('Auth middleware - Decoded token:', decoded);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });
      console.log('Auth middleware - Found user:', user?.id);

      if (!user) {
        console.log('Auth middleware - No user found');
        res.status(401).json({ error: 'Please authenticate.' });
        return;
      }

      req.user = user;
      next();
    } catch (jwtError) {
      console.error('Auth middleware - JWT Error:', jwtError);
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware - Error:', error);
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

export const requireHost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user?.role !== 'HOST') {
      res.status(403).json({ error: 'This action requires host privileges.' });
      return;
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
}; 