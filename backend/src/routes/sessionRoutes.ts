import { Router } from 'express';
import { createSession, joinSession, getActiveSessions, endSession, leaveSession } from '../controllers/sessionController';
import { auth, requireHost } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();

// All routes require authentication
router.use(auth);

// Create session (HOST only)
router.post('/', [
  requireHost,
  body('title').notEmpty(),
  body('defaultLang').isIn(['EN', 'UK', 'DE']),
  body('isPublic').isBoolean()
], createSession);

// Join session
router.post('/join', [
  body('sessionId').notEmpty(),
  body('language').isIn(['EN', 'UK', 'DE'])
], joinSession);

// Get active sessions
router.get('/active', getActiveSessions);

// End session (HOST only)
router.post('/:sessionId/end', requireHost, endSession);

// Leave session
router.post('/:sessionId/leave', leaveSession);

export default router; 