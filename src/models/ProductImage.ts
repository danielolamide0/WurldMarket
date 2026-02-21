import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IProductImage extends Document {
  _id: mongoose.Types.ObjectId
  data: Buffer
  contentType: string
  createdAt: Date
}

const ProductImageSchema = new Schema<IProductImage>(
  {
    data: {
      type: Buffer,
      required: true,
    },
    contentType: {
      type: String,
      required: true,
      default: 'image/jpeg',
    },
  },
  { timestamps: true }
)

const ProductImage: Model<IProductImage> =
  mongoose.models.ProductImage || mongoose.model<IProductImage>('ProductImage', ProductImageSchema)
export default ProductImage
