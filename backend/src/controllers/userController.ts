import { Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginBody, RegisterBody, AuthRequest } from '../types';

// Initialize Prisma client with connection pooling
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const register = async (req: Request<{}, {}, RegisterBody>, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(400).json({ error: 'Email already in use' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with NULL role by default
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: undefined
      }
    });

    // Generate token
    const token = jwt.sign({ id: user.id }, JWT_SECRET);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
};

export const login = async (req: Request<{}, {}, LoginBody>, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Ensure user has NULL role if not in a session
    if (user.role !== null) {
      // Check if user is in any active session
      const activeSession = await prisma.session.findFirst({
        where: {
          OR: [
            { hostId: user.id },
            { participants: { some: { userId: user.id } } }
          ],
          status: 'ACTIVE'
        }
      });

      // If not in any active session, reset role to NULL
      if (!activeSession) {
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: { role: undefined }
        });
        user.role = updatedUser.role;
      }
    }

    // Generate token
    const token = jwt.sign({ id: user.id }, JWT_SECRET);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
};

export const updateRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('Update role - Request body:', req.body);
    const { role } = req.body as { role: UserRole | null };
    const userId = req.user?.id;
    console.log('Update role - User ID:', userId);

    if (!userId) {
      console.log('Update role - No user ID found');
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check if user exists and get current role
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      console.log('Update role - User not found:', userId);
      res.status(404).json({ error: 'User not found' });
      return;
    }

    console.log('Update role - Current user role:', existingUser.role);
    console.log('Update role - Requested role:', role);

    // If user already has the target role, return success
    if (existingUser.role === role) {
      console.log('Update role - User already has role:', role);
      res.json({
        message: 'User already has the requested role',
        user: existingUser
      });
      return;
    }

    // Allow role changes in these scenarios:
    // 1. NULL -> HOST (when creating session)
    // 2. NULL -> CLIENT (when joining session)
    // 3. HOST -> NULL (when ending session)
    // 4. CLIENT -> NULL (when leaving session)
    const validTransitions = [
      { from: null, to: 'HOST' },
      { from: null, to: 'CLIENT' },
      { from: 'HOST', to: null },
      { from: 'CLIENT', to: null }
    ];

    const isValidTransition = validTransitions.some(
      transition => transition.from === existingUser.role && transition.to === role
    );

    if (!isValidTransition) {
      console.log('Update role - Invalid role transition:', { 
        from: existingUser.role, 
        to: role,
        validTransitions
      });
      res.status(400).json({ 
        error: 'Invalid role transition',
        currentRole: existingUser.role,
        requestedRole: role,
        validTransitions
      });
      return;
    }

    console.log('Update role - Attempting to update user:', { 
      userId, 
      from: existingUser.role, 
      to: role 
    });

    // Update the role synchronously
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: role === null ? undefined : role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    console.log('Update role - Successfully updated user:', updatedUser);
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating role:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    res.status(500).json({ 
      error: 'Error updating role', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}; 