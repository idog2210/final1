import bcrypt from 'bcrypt';
import { StatusCodes as HSC } from 'http-status-codes';
import { UserModel } from '../models/User.model';
import { signAccessToken } from '../utils/jwt';
import type { RegisterInput, LoginInput } from '../validation/user.schemas';

export class AuthError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function registerUser(input: RegisterInput) {
  const email = input.email.toLowerCase().trim();

  const existing = await UserModel.findOne({
    $or: [{ email }, { personalNumber: input.personalNumber.trim() }],
  });

  if (existing) {
    throw new AuthError('User with this email or personal number already exists', HSC.CONFLICT);
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await UserModel.create({
    name: input.name.trim(),
    personalNumber: input.personalNumber.trim(),
    email,
    passwordHash,
    bahadRole: input.bahadRole.trim(),
    systemRole: 'user',
  });

  const accessToken = signAccessToken({
    userId: user._id.toString(),
    systemRole: user.systemRole,
  });

  return { user, accessToken };
}

export async function loginUser(input: LoginInput) {
  const email = input.email.toLowerCase().trim();

  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new AuthError('Invalid credentials', HSC.UNAUTHORIZED);
  }

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    throw new AuthError('Invalid credentials', HSC.UNAUTHORIZED);
  }

  const accessToken = signAccessToken({
    userId: user._id.toString(),
    systemRole: user.systemRole,
  });

  return { user, accessToken };
}
