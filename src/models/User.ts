import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  password: string
  role: 'customer' | 'vendor'
  name: string
  email?: string
  phone?: string
  vendorId?: mongoose.Types.ObjectId
  authMethod: 'email'
  isEmailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['customer', 'vendor'],
      default: 'customer',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
    },
    authMethod: {
      type: String,
      enum: ['email'],
      default: 'email',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

// One email per account across the app (customer or vendor); sparse allows legacy users without email
UserSchema.index({ email: 1 }, { unique: true, sparse: true })

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
export default User
