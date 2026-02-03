import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

export const SYSTEM_ROLES = ['user', 'admin', 'superadmin'] as const;
export type SystemRole = (typeof SYSTEM_ROLES)[number];

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },

    personalNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },

    passwordHash: { type: String, required: true },

    bahadRole: { type: String, required: true, trim: true },

    systemRole: {
      type: String,
      enum: SYSTEM_ROLES,
      default: 'user',
      required: true,
    },

    resetPasswordTokenHash: { type: String },
    resetPasswordExpiresAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    delete ret.passwordHash;
    return ret;
  },
});

export type User = InferSchemaType<typeof userSchema>;
export type UserDoc = HydratedDocument<User>;

export const UserModel = model<User>('User', userSchema);
