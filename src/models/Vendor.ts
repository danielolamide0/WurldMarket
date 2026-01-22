import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IVendor extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  slug: string
  description: string
  logo?: string
  contactEmail: string
  contactPhone: string
  isLive: boolean
  createdAt: Date
  updatedAt: Date
}

const VendorSchema = new Schema<IVendor>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
    },
    logo: String,
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    isLive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

VendorSchema.index({ slug: 1 })
VendorSchema.index({ isLive: 1 })

const Vendor: Model<IVendor> = mongoose.models.Vendor || mongoose.model<IVendor>('Vendor', VendorSchema)
export default Vendor
