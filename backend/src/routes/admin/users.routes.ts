import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { UserModel } from '../../models/User.model';
import { StatusCodes as HSC } from 'http-status-codes';

const router = Router();

// MICHAL: יש לך route כזה בדיוק כבר בuserRouter הרגיל
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const editorRole = (req as any).user.systemRole as string;

    if (editorRole !== 'superadmin') {
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

    const update: any = {};
    if (name !== undefined) update.name = String(name).trim();
    if (bahadRole !== undefined) update.bahadRole = String(bahadRole).trim();

    if (systemRole !== undefined) {
      // MICHAL: תשווה מול המערך שלך
      if (systemRole !== 'user' && systemRole !== 'admin' && systemRole !== 'superadmin') {
        return res.status(HSC.BAD_REQUEST).json({
          status: 'error',
          message: 'Invalid role',
        });
      }
      update.systemRole = systemRole;
    }

    if ('email' in req.body || 'password' in req.body || 'passwordHash' in req.body) {
      return res.status(HSC.BAD_REQUEST).json({
        status: 'error',
        message: 'Illegal fields',
      });
    }

    const user = await UserModel.findByIdAndUpdate(req.params.id, update, { new: true });
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
