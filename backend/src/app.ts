import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import requestRoutes from './routes/request.routes';
import adminRoutes from './routes/admin';
import userRoutes from './routes/user.routes';

const app = express();

const corsOptions: cors.CorsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/requests', requestRoutes);
app.use('/admin', adminRoutes);
app.use('/users', userRoutes);

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('[ERROR]', err);
  return res.status(500).json({
    status: 'error',
    message: 'Server error',
    details: err?.message ?? err,
  });
});

export default app;
