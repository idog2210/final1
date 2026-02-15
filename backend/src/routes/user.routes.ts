import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { UserModel } from '../models/User.model';
import bcrypt from 'bcrypt';
import { StatusCodes as HSC } from 'http-status-codes';
import { Types } from 'mongoose';

const router = Router();

router.get('/me', requireAuth, async (req, res) => {
  const userId = (req as any).user.userId as string;
  // MICHAL: בדיקה שהמשתמש באמת קיים צריכה להיות חלק מהאותנטיקציה
  // MICHAL: איפה הtry catch?
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
  // MICHAL: name כבר string
  if (name !== undefined) update.name = name.trim();
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
  // MICHAL: למה כאן אתה לא ישירות עושה destructuring על הbody?
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

  // MICHAL: ביצירת המשתמש אתה לא בודק את אורך הסיסמא, השתדל להיות אחיד
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

// MICHAL: כל שאר הendpoints שדורשות הרשאות מנהל נמצאות בrouter מיועד, למה זה נפרד?
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const role = req.query.role as string | undefined;

    const filter: any = {};

    // MICHAL: הרגע בדקת שמדובר במנהל, אין טעם לבדוק את זה
    if (role !== undefined) {
      if (role !== 'user' && role !== 'admin' && role !== 'superadmin') {
        return res.status(HSC.BAD_REQUEST).json({
          status: 'error',
          message: 'Invalid role',
        });
      }
      // MICHAL: כולם יכולים לראות רק ברמה שלהם ולא גם בכל הרמות מתחת?
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
      // MICHAL: יצרת type בדיוק כזה
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
      // MICHAL: יש לך מערך של הערכים המותרים, תבדוק מולו
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
