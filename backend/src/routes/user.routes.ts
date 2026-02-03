import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { UserModel } from '../models/User.model';
import bcrypt from 'bcrypt';
import { StatusCodes as HSC } from 'http-status-codes';
import { Types } from 'mongoose';

const router = Router();

router.get('/me', requireAuth, async (req, res) => {
  const userId = (req as any).user.userId as string;
  const user = await UserModel.findById(userId);
  if (!user) {
    return res.status(HSC.NOT_FOUND).json({
      status: 'error',
      message: 'User not found',
    });
  }
  return res.status(HSC.OK).json({
    status: 'success',
    message: 'User fetched successfully',
    data: { user },
  });
});

router.patch('/me', requireAuth, async (req, res) => {
  const userId = (req as any).user.userId as string;

  const { name, bahadRole } = req.body as { name?: string; bahadRole?: string };

  const update: any = {};
  if (name !== undefined) update.name = String(name).trim();
  if (bahadRole !== undefined) update.bahadRole = String(bahadRole).trim();

  if ('systemRole' in req.body || 'email' in req.body || 'password' in req.body || 'passwordHash' in req.body) {
    return res.status(HSC.BAD_REQUEST).json({
      status: 'error',
      message: 'Illegal fields',
    });
  }

  const user = await UserModel.findByIdAndUpdate(userId, update, { new: true });
  if (!user) {
    return res.status(HSC.NOT_FOUND).json({
      status: 'error',
      message: 'User not found',
    });
  }

  return res.status(HSC.OK).json({
    status: 'success',
    message: 'User updated successfully',
    data: { user },
  });
});

router.patch('/me/password', requireAuth, async (req, res) => {
  const userId = (req as any).user.userId as string;
  const body = (req.body ?? {}) as { currentPassword?: string; newPassword?: string };
  const { currentPassword, newPassword } = body;

  if (!currentPassword || !newPassword) {
    return res.status(HSC.BAD_REQUEST).json({
      status: 'error',
      message: 'Missing fields',
    });
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    return res.status(HSC.NOT_FOUND).json({
      status: 'error',
      message: 'User not found',
    });
  }

  const ok = await bcrypt.compare(String(currentPassword), user.passwordHash);
  if (!ok) {
    return res.status(HSC.UNAUTHORIZED).json({
      status: 'error',
      message: 'Invalid credentials',
    });
  }

  if (String(newPassword).length < 8) {
    return res.status(HSC.BAD_REQUEST).json({
      status: 'error',
      message: 'Password too short',
    });
  }

  user.passwordHash = await bcrypt.hash(String(newPassword), 10);
  await user.save();

  return res.status(HSC.OK).json({
    status: 'success',
    message: 'Password updated successfully',
  });
});

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const role = req.query.role as string | undefined;

    const filter: any = {};

    if (role !== undefined) {
      if (role !== 'user' && role !== 'admin' && role !== 'superadmin') {
        return res.status(HSC.BAD_REQUEST).json({
          status: 'error',
          message: 'Invalid role',
        });
      }
      filter.systemRole = role;
    }

    const users = await UserModel.find(filter).sort({ createdAt: -1 }).select('-passwordHash').lean();

    return res.status(HSC.OK).json({
      status: 'success',
      message: 'Users fetched successfully',
      data: { users },
    });
  } catch {
    return res.status(HSC.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Server error',
    });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const viewerId = (req as any).user.userId as string;
    const viewerRole = (req as any).user.systemRole as string;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(HSC.BAD_REQUEST).json({
        status: 'error',
        message: 'Invalid id',
      });
    }

    const isAdmin = viewerRole === 'admin' || viewerRole === 'superadmin';
    const isSelf = viewerId === id;

    if (!isAdmin && !isSelf) {
      return res.status(HSC.FORBIDDEN).json({
        status: 'error',
        message: 'Forbidden',
      });
    }

    const user = await UserModel.findById(id).select('-passwordHash').lean();
    if (!user) {
      return res.status(HSC.NOT_FOUND).json({
        status: 'error',
        message: 'User not found',
      });
    }

    return res.status(HSC.OK).json({
      status: 'success',
      message: 'User fetched successfully',
      data: { user },
    });
  } catch {
    return res.status(HSC.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Server error',
    });
  }
});

router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const editorId = (req as any).user.userId as string;
    const editorRole = (req as any).user.systemRole as string;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(HSC.BAD_REQUEST).json({
        status: 'error',
        message: 'Invalid id',
      });
    }

    const canEdit = editorId === id || editorRole === 'superadmin';
    if (!canEdit) {
      return res.status(HSC.FORBIDDEN).json({
        status: 'error',
        message: 'Forbidden',
      });
    }

    const { name, bahadRole, systemRole } = req.body as {
      name?: string;
      bahadRole?: string;
      systemRole?: 'user' | 'admin' | 'superadmin';
    };

    if ('email' in req.body || 'password' in req.body || 'passwordHash' in req.body) {
      return res.status(HSC.BAD_REQUEST).json({
        status: 'error',
        message: 'Illegal fields',
      });
    }

    const update: any = {};
    if (name !== undefined) update.name = String(name).trim();
    if (bahadRole !== undefined) update.bahadRole = String(bahadRole).trim();

    if (systemRole !== undefined) {
      if (editorRole !== 'superadmin') {
        return res.status(HSC.FORBIDDEN).json({
          status: 'error',
          message: 'Only superadmin can change roles',
        });
      }
      if (systemRole !== 'user' && systemRole !== 'admin' && systemRole !== 'superadmin') {
        return res.status(HSC.BAD_REQUEST).json({
          status: 'error',
          message: 'Invalid role',
        });
      }
      update.systemRole = systemRole;
    }

    const user = await UserModel.findByIdAndUpdate(id, update, { new: true }).select('-passwordHash');
    if (!user) {
      return res.status(HSC.NOT_FOUND).json({
        status: 'error',
        message: 'User not found',
      });
    }

    return res.status(HSC.OK).json({
      status: 'success',
      message: 'User updated successfully',
      data: { user },
    });
  } catch {
    return res.status(HSC.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Server error',
    });
  }
});

export default router;
