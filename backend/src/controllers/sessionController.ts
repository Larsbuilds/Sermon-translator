import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, CreateSessionBody, JoinSessionBody } from '../types';

const prisma = new PrismaClient();

export const createSession = async (req: AuthRequest & { body: CreateSessionBody }, res: Response): Promise<void> => {
  try {
    const { title, description, defaultLang, isPublic } = req.body;
    const hostId = req.user?.id;

    if (!hostId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const session = await prisma.session.create({
      data: {
        title,
        description,
        defaultLang,
        isPublic,
        hostId,
        status: 'ACTIVE'
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: 'Error creating session' });
  }
};

export const joinSession = async (req: AuthRequest & { body: JoinSessionBody }, res: Response): Promise<void> => {
  try {
    const { sessionId, language } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Check if session exists and is active
    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    if (session.status !== 'ACTIVE') {
      res.status(400).json({ error: 'Session is not active' });
      return;
    }

    // Join session
    const participant = await prisma.sessionParticipant.create({
      data: {
        sessionId,
        userId,
        language
      },
      include: {
        session: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(participant);
  } catch (error) {
    res.status(500).json({ error: 'Error joining session' });
  }
};

export const getActiveSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        OR: [
          { isPublic: true },
          { hostId: req.user?.id }
        ],
        status: 'ACTIVE'
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching sessions' });
  }
};

export const endSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        participants: {
          select: {
            userId: true
          }
        }
      }
    });

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    if (session.hostId !== userId) {
      res.status(403).json({ error: 'Only the host can end the session' });
      return;
    }

    // Update session status
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'ENDED',
        endedAt: new Date()
      }
    });

    // Reset host's role to undefined
    await prisma.user.update({
      where: { id: session.hostId },
      data: { role: undefined }
    });

    // Reset all participants' roles to undefined
    if (session.participants && session.participants.length > 0) {
      await prisma.user.updateMany({
        where: {
          id: {
            in: session.participants.map(p => p.userId)
          }
        },
        data: { role: undefined }
      });
    }

    res.json(updatedSession);
  } catch (error) {
    res.status(500).json({ error: 'Error ending session' });
  }
};

export const leaveSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id;

    // Find the session participant
    const participant = await prisma.sessionParticipant.findFirst({
      where: {
        sessionId,
        userId,
        leftAt: undefined
      }
    });

    if (!participant) {
      res.status(404).json({ error: 'Participant not found in session' });
      return;
    }

    // Update participant's leftAt timestamp
    await prisma.sessionParticipant.update({
      where: { id: participant.id },
      data: { leftAt: new Date() }
    });

    // Reset client's role to undefined
    await prisma.user.update({
      where: { id: userId },
      data: { role: undefined }
    });

    res.json({ message: 'Successfully left the session' });
  } catch (error) {
    res.status(500).json({ error: 'Error leaving session' });
  }
}; 