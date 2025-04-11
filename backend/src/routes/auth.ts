import express, { Request, Response, NextFunction } from 'express';
import { register, login, updateRole } from '../controllers/userController';
import { auth } from '../middleware/auth';
import { body, validationResult } from 'express-validator';
import getRawBody = require('raw-body');

const router = express.Router();

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Update role route
router.patch('/role', auth, [
  body('role').custom((value) => {
    console.log('Role validation - Received value:', value);
    // Allow undefined, 'HOST', or 'CLIENT'
    if (value === undefined || value === 'HOST' || value === 'CLIENT') {
      return true;
    }
    throw new Error(`Invalid role value: ${value}`);
  })
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Role update route - Request body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Role update route - Validation errors:', errors.array());
      return res.status(400).json({ 
        error: 'Invalid role value',
        details: errors.array() 
      });
    }
    await updateRole(req, res);
  } catch (error) {
    console.error('Role update route - Error:', error);
    res.status(500).json({ 
      error: 'Error updating role',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 