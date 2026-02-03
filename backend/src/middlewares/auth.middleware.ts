import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes as HSC } from 'http-status-codes';

type AuthPayload = {
  userId: string;
  systemRole: 'user' | 'admin' | 'superadmin';
};

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return res.status(HSC.UNAUTHORIZED).json({
      status: 'error',
      message: 'Unauthorized',
    });
  }

  try {
    const token = header.replace('Bearer ', '');
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(HSC.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Missing JWT_SECRET',
      });
    }

    const payload = jwt.verify(token, secret) as AuthPayload;

    (req as any).user = payload;

    next();
  } catch {
    return res.status(HSC.UNAUTHORIZED).json({
      status: 'error',
      message: 'Invalid token',
    });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const role = (req as any).user?.systemRole;

  if (role !== 'admin' && role !== 'superadmin') {
    return res.status(HSC.FORBIDDEN).json({
      status: 'error',
      message: 'Forbidden',
    });
  }

  next();
}
