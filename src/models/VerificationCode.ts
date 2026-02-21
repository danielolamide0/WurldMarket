import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IVerificationCode extends Document {
  _id: mongoose.Types.ObjectId
  email: string
  code: string
  type: 'signup' | 'password-reset' | 'email-change' | 'delete-vendor-account'
  expiresAt: Date
  used: boolean
  createdAt: Date
  updatedAt: Date
}

const VerificationCodeSchema = new Schema<IVerificationCode>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    code: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['signup', 'password-reset', 'email-change', 'delete-vendor-account'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

// Index for efficient lookups
VerificationCodeSchema.index({ email: 1, type: 1 })
// TTL index to auto-delete expired codes after 1 hour
VerificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 })

const VerificationCode: Model<IVerificationCode> =
  mongoose.models.VerificationCode ||
  mongoose.model<IVerificationCode>('VerificationCode', VerificationCodeSchema)

export default VerificationCode
