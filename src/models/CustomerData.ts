import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICustomerData extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  favorites: mongoose.Types.ObjectId[]
  regulars: mongoose.Types.ObjectId[]
  purchaseHistory: {
    productId: mongoose.Types.ObjectId
    purchasedAt: Date
    quantity: number
  }[]
  createdAt: Date
  updatedAt: Date
}

const CustomerDataSchema = new Schema<ICustomerData>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    regulars: [{ type: Schema.Types.ObjectId, ref: 'Vendor' }],
    purchaseHistory: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        purchasedAt: { type: Date, default: Date.now },
        quantity: { type: Number, default: 1, min: 1 },
      },
    ],
  },
  { timestamps: true }
)

// userId already has unique: true which creates an index

const CustomerData: Model<ICustomerData> =
  mongoose.models.CustomerData || mongoose.model<ICustomerData>('CustomerData', CustomerDataSchema)
export default CustomerData
