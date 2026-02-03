import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

export const REQUEST_TYPES = ['BLACKENING', 'ENTRY_APPROVAL', 'MILITARY_ID_CODING', 'SHOS'] as const;

export type RequestType = (typeof REQUEST_TYPES)[number];

export const REQUEST_STATUSES = ['OPEN', 'APPROVED', 'REJECTED'] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

const requestSchema = new Schema(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    type: {
      type: String,
      enum: REQUEST_TYPES,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: REQUEST_STATUSES,
      default: 'OPEN',
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    decidedAt: {
      type: Date,
    },

    decidedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

requestSchema.index({ createdBy: 1, type: 1, createdAt: -1 });

export type Request = InferSchemaType<typeof requestSchema>;
export type RequestDoc = HydratedDocument<Request>;

export const RequestModel = model<Request>('Request', requestSchema);
