import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import sessionRoutes from './routes/sessionRoutes';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Request headers:', req.headers);
  next();
});

// Routes
console.log('Mounting routes...');
app.use('/auth', authRoutes);
console.log('Mounted /auth routes');

app.use('/api/users', userRoutes);
console.log('Mounted /api/users routes');

app.use('/api/sessions', sessionRoutes);
console.log('Mounted /api/sessions routes');

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler - Error:', err);
  console.error('Global error handler - Stack:', err.stack);
  
  // Check if it's a Prisma error
  if (err.name === 'PrismaClientKnownRequestError') {
    console.error('Prisma error details:', err);
    return res.status(500).json({ 
      error: 'Database error',
      message: err.message,
      code: (err as any).code,
      meta: (err as any).meta,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }

  // Check if it's a validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation error',
      message: err.message,
      details: (err as any).errors
    });
  }

  // Default error response
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('Available routes:');
  console.log('- /auth/login');
  console.log('- /auth/register');
  console.log('- /api/users/role');
  console.log('- /api/sessions');
}); 