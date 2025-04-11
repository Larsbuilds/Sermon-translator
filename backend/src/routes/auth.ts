import express, { Request, Response, NextFunction } from 'express';
import { register, login, updateRole } from '../controllers/userController';
import { auth } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Update role route
router.patch('/role', auth, [
  body('role').isIn(['HOST', 'CLIENT'])
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Role update route - Request body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Role update route - Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    await updateRole(req, res);
  } catch (error) {
    console.error('Role update route - Error:', error);
    next(error);
  }
});

export default router; 