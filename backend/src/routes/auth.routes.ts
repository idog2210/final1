import { Router } from 'express';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/User.model';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { StatusCodes as HSC } from 'http-status-codes';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { name, personalNumber, email, password, bahadRole } = req.body;

    if (!name || !personalNumber || !email || !password || !bahadRole) {
      return res.status(HSC.BAD_REQUEST).json({
        status: 'error',
        message: 'Missing fields',
      });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanPersonal = String(personalNumber).trim();

    const exists = await UserModel.findOne({
      $or: [{ email: cleanEmail }, { personalNumber: cleanPersonal }],
    });

    if (exists) {
      return res.status(HSC.CONFLICT).json({
        status: 'error',
        message: 'User already exists',
      });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const user = await UserModel.create({
      name: String(name).trim(),
      personalNumber: cleanPersonal,
      email: cleanEmail,
      passwordHash,
      bahadRole: String(bahadRole).trim(),
      systemRole: 'user',
    });

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(HSC.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Missing JWT_SECRET',
      });
    }

    const token = jwt.sign({ userId: user._id.toString(), systemRole: user.systemRole }, secret, { expiresIn: '15m' });

    return res.status(HSC.CREATED).json({
      status: 'success',
      message: 'Registered successfully',
      data: { token, user },
    });
  } catch (err) {
    return res.status(HSC.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Server error',
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(HSC.BAD_REQUEST).json({
        status: 'error',
        message: 'Missing fields',
      });
    }

    const cleanEmail = String(email).toLowerCase().trim();

    const user = await UserModel.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(HSC.UNAUTHORIZED).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) {
      return res.status(HSC.UNAUTHORIZED).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(HSC.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Missing JWT_SECRET',
      });
    }

    const token = jwt.sign({ userId: user._id.toString(), systemRole: user.systemRole }, secret, { expiresIn: '15m' });

    return res.status(HSC.OK).json({
      status: 'success',
      message: 'Logged in successfully',
      data: { token, user },
    });
  } catch (err) {
    return res.status(HSC.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Server error',
    });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email) {
      return res.status(HSC.BAD_REQUEST).json({
        status: 'error',
        message: 'Missing email',
      });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const user = await UserModel.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(HSC.OK).json({
        status: 'success',
        message: 'If the email exists, a reset token was generated',
      });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    return res.status(HSC.OK).json({
      status: 'success',
      message: 'Reset token generated',
      data: { devResetToken: rawToken },
    });
  } catch {
    return res.status(HSC.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Server error',
    });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body as { token?: string; newPassword?: string };
    if (!token || !newPassword) {
      return res.status(HSC.BAD_REQUEST).json({
        status: 'error',
        message: 'Missing fields',
      });
    }

    if (String(newPassword).length < 8) {
      return res.status(HSC.BAD_REQUEST).json({
        status: 'error',
        message: 'Password too short',
      });
    }

    const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');

    const user = await UserModel.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(HSC.BAD_REQUEST).json({
        status: 'error',
        message: 'Invalid or expired token',
      });
    }

    user.passwordHash = await bcrypt.hash(String(newPassword), 10);
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    return res.status(HSC.OK).json({
      status: 'success',
      message: 'Password reset successfully',
    });
  } catch {
    return res.status(HSC.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Server error',
    });
  }
});

export default router;
