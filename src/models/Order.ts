import mongoose, { Schema, Document, Model } from 'mongoose'

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
export type OrderType = 'delivery' | 'pickup'

interface OrderItem {
  productId: mongoose.Types.ObjectId
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  unit: string
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId
  customerId: mongoose.Types.ObjectId
  customerName: string
  customerPhone: string
  vendorId: mongoose.Types.ObjectId
  storeId: mongoose.Types.ObjectId
  storeName: string
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  total: number
  status: OrderStatus
  orderType: OrderType
  deliveryAddress?: string
  notes?: string
  /** True when order was placed as guest (no account); use for analytics and filtering. */
  isGuestOrder?: boolean
  /** Customer rating 0–5 after order is completed */
  rating?: number
  /** Customer review text after order is completed */
  review?: string
  createdAt: Date
  updatedAt: Date
}

const OrderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true },
  },
  { _id: false }
)

const OrderSchema = new Schema<IOrder>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    storeName: { type: String, required: true },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
      default: 'pending',
    },
    orderType: { type: String, enum: ['delivery', 'pickup'], required: true },
    deliveryAddress: { type: String, trim: true },
    notes: { type: String, trim: true },
    isGuestOrder: { type: Boolean, default: false },
    rating: { type: Number, min: 0, max: 5 },
    review: { type: String, trim: true },
  },
  { timestamps: true }
)

OrderSchema.index({ customerId: 1 })
OrderSchema.index({ vendorId: 1 })
OrderSchema.index({ status: 1 })
OrderSchema.index({ createdAt: -1 })
OrderSchema.index({ isGuestOrder: 1 })

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)
export default Order
