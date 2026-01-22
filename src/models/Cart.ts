import mongoose, { Schema, Document, Model } from 'mongoose'

interface CartItem {
  productId: mongoose.Types.ObjectId
  storeId: mongoose.Types.ObjectId
  vendorId: mongoose.Types.ObjectId
  name: string
  price: number
  unit: string
  image: string
  quantity: number
  stock: number
}

export interface ICart extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  items: CartItem[]
  createdAt: Date
  updatedAt: Date
}

const CartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true },
    image: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    stock: { type: Number, required: true, min: 0 },
  },
  { _id: false }
)

const CartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [CartItemSchema],
  },
  { timestamps: true }
)

CartSchema.index({ userId: 1 })

const Cart: Model<ICart> = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema)
export default Cart
