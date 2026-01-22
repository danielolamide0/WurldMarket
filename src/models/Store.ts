import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IStore extends Document {
  _id: mongoose.Types.ObjectId
  vendorId: mongoose.Types.ObjectId
  name: string
  address: string
  city: string
  postcode: string
  coordinates: { lat: number; lng: number }
  openingHours: Record<string, { open: string; close: string } | 'closed'>
  isActive: boolean
  image?: string
  createdAt: Date
  updatedAt: Date
}

const StoreSchema = new Schema<IStore>(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
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
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    openingHours: {
      type: Schema.Types.Mixed,
      default: {
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '18:00' },
        friday: { open: '09:00', close: '18:00' },
        saturday: { open: '10:00', close: '17:00' },
        sunday: 'closed',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    image: String,
  },
  { timestamps: true }
)

StoreSchema.index({ vendorId: 1 })
StoreSchema.index({ city: 1 })
StoreSchema.index({ isActive: 1 })

const Store: Model<IStore> = mongoose.models.Store || mongoose.model<IStore>('Store', StoreSchema)
export default Store
