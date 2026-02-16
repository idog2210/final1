import { Router } from 'express';
import { requireAuth, requireAdmin } from '../../middlewares/auth.middleware';
import { RequestModel, REQUEST_TYPES } from '../../models/Request.model';
import { Types } from 'mongoose';
import { StatusCodes as HSC } from 'http-status-codes';

const router = Router();

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, type, userId, from, to } = req.query as {
      status?: string;
      type?: string;
      userId?: string;
      from?: string;
      to?: string;
    };

    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = 50;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (status) {
      // MICHAL: switch case
      // MICHAL: אבל בכל מקרה עדיף פשוט לבדוק אם open approved or rejected בבת אחד ואם כן לשים את status, ולטפל פרטנית רק במקרים המיוחדים
      if (status === 'OPEN') filter.status = 'OPEN';
      else if (status === 'APPROVED') filter.status = 'APPROVED';
      else if (status === 'REJECTED') filter.status = 'REJECTED';
      else if (status === 'CLOSED') filter.status = { $in: ['APPROVED', 'REJECTED'] };
      else {
        return res.status(HSC.BAD_REQUEST).json({
          status: 'error',
          message: 'Invalid status',
        });
      }
    }

    if (type) {
      if (!REQUEST_TYPES.includes(type as any)) {
        return res.status(HSC.BAD_REQUEST).json({
          status: 'error',
          message: 'Invalid type',
        });
      }
      filter.type = type;
    }

    if (userId) {
      if (!Types.ObjectId.isValid(userId)) {
        return res.status(HSC.BAD_REQUEST).json({
          status: 'error',
          message: 'Invalid userId',
        });
      }
      filter.createdBy = new Types.ObjectId(userId);
    }

    if (from || to) {
      filter.createdAt = {};
      if (from) {
        const d = new Date(from);
        if (Number.isNaN(d.getTime())) {
          return res.status(HSC.BAD_REQUEST).json({
            status: 'error',
            message: 'Invalid from',
          });
        }
        filter.createdAt.$gte = d;
      }
      if (to) {
        const d = new Date(to);
        if (Number.isNaN(d.getTime())) {
          return res.status(HSC.BAD_REQUEST).json({
            status: 'error',
            message: 'Invalid to',
          });
        }
        filter.createdAt.$lte = d;
      }
    }

    const requests = await RequestModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

    return res.status(HSC.OK).json({
      status: 'success',
      message: 'Requests fetched successfully',
      data: { requests },
    });
  } catch {
    return res.status(HSC.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Server error',
    });
  }
});

router.patch('/:id/decide', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { decision, rejectionReason } = req.body as {
      // MICHAL: זה סתם מסבך ליצור את זה ככה. שישלחו isApproved: boolean. זה חוסך בדיקות וטעויות לא נחוצות
      decision: 'APPROVE' | 'REJECT';
      rejectionReason?: string;
    };

    if (decision !== 'APPROVE' && decision !== 'REJECT') {
      return res.status(HSC.BAD_REQUEST).json({
        status: 'error',
        message: 'Invalid decision',
      });
    }

    if (decision === 'REJECT' && !rejectionReason) {
      return res.status(HSC.BAD_REQUEST).json({
        status: 'error',
        message: 'Missing rejection Reason',
      });
    }

    const adminId = (req as any).user.userId as string;

    const update: any = {
      status: decision === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      decidedAt: new Date(),
      decidedBy: adminId,
    };

    if (decision === 'REJECT') {
      update.rejectionReason = String(rejectionReason).trim();
    } else {
      update.rejectionReason = undefined;
    }

    const request = await RequestModel.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!request) {
      return res.status(HSC.NOT_FOUND).json({
        status: 'error',
        message: 'Request not found',
      });
    }

    return res.status(HSC.OK).json({
      status: 'success',
      message: 'Request decided successfully',
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
