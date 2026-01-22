import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISavedAddress extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  label: string
  fullAddress: string
  city: string
  postcode: string
  isPrimary: boolean
  createdAt: Date
  updatedAt: Date
}

const SavedAddressSchema = new Schema<ISavedAddress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    label: {
      type: String,
      default: 'Home',
      trim: true,
    },
    fullAddress: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    postcode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

// Compound index covers both use cases
SavedAddressSchema.index({ userId: 1, isPrimary: 1 })

const SavedAddress: Model<ISavedAddress> =
  mongoose.models.SavedAddress || mongoose.model<ISavedAddress>('SavedAddress', SavedAddressSchema)
export default SavedAddress
