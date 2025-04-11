import { Router, Request, Response, NextFunction } from 'express';
import { register, login, updateRole } from '../controllers/userController';
import { body, validationResult } from 'express-validator';
import { auth } from '../middleware/auth';

const router = Router();

router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty(),
  body('role').optional().isIn(['HOST', 'CLIENT'])
], (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  register(req, res).catch(next);
});

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  login(req, res).catch(next);
});

router.patch('/role', [
  auth,
  body('role').isIn(['HOST', 'CLIENT', null])
], (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  updateRole(req, res).catch(next);
});

export default router; 