import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { RequestModel, REQUEST_TYPES } from '../models/Request.model';
import { StatusCodes as HSC } from 'http-status-codes';
import { Types } from 'mongoose';

const router = Router();

router.post('/', requireAuth, async (req, res) => {
  try {
    const { type, title, reason } = req.body;
    const userId = (req as any).user.userId as string;

    if (!REQUEST_TYPES.includes(type)) {
      return res.status(HSC.BAD_REQUEST).json({
        status: 'error',
        message: 'Invalid request type',
      });
    }

    if (!title || !reason) {
      return res.status(HSC.BAD_REQUEST).json({
        status: 'error',
        message: 'Missing fields',
      });
    }

    const request = await RequestModel.create({
      createdBy: userId,
      type,
      title: String(title).trim(),
      reason: String(reason).trim(),
    });

    return res.status(HSC.CREATED).json({
      status: 'success',
      message: 'Request created successfully',
      data: { request },
    });
  } catch {
    return res.status(HSC.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Server error',
    });
  }
});

router.get('/my', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.userId as string;
    const status = (req.query.status as string) || 'ALL';

    const filter: any = { createdBy: userId };

    if (status === 'OPEN') filter.status = 'OPEN';
    if (status === 'CLOSED') filter.status = { $in: ['APPROVED', 'REJECTED'] };

    const requests = await RequestModel.find(filter).sort({ createdAt: -1 }).lean();
    return res.status(HSC.OK).json({
      status: 'success',
      message: 'My requests fetched successfully',
      data: { requests },
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
    const userId = (req as any).user.userId as string;
    const role = (req as any).user.systemRole as string;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(HSC.BAD_REQUEST).json({
        status: 'error',
        message: 'Invalid id',
      });
    }

    const request = await RequestModel.findById(id).lean();

    if (!request) {
      return res.status(HSC.NOT_FOUND).json({
        status: 'error',
        message: 'Request not found',
      });
    }

    // MICHAL: יכול גם לבדוק פשוט אם מכיל admin
    const isAdmin = role === 'admin' || role === 'superadmin';
    // MICHAL: createdBy is required, מה הצורך לבדוק את זה?
    const createdById = request.createdBy ? String(request.createdBy) : '';
    const isOwner = createdById === userId;

    if (!isAdmin && !isOwner) {
      return res.status(HSC.FORBIDDEN).json({
        status: 'error',
        message: 'Forbidden',
      });
    }

    return res.status(HSC.OK).json({
      status: 'success',
      message: 'Request fetched successfully',
      data: { request },
    });
  } catch {
    return res.status(HSC.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Server error',
    });
  }
});

export default router;
