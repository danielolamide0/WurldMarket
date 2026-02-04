import mongoose, { Schema, Document, Model } from 'mongoose'

export type ProductCategory =
  | 'fresh-produce'
  | 'tubers-roots'
  | 'fresh-vegetables'
  | 'fresh-fruits'
  | 'fresh-meat'
  | 'fresh-fish-seafood'
  | 'smoked-dried-fish-meat'
  | 'frozen-foods'
  | 'rice-grains'
  | 'flour-meal'
  | 'beans-lentils-pulses'
  | 'spices-seasonings'
  | 'sauces-pastes'
  | 'cooking-oils-fats'
  | 'noodles-pasta'
  | 'ready-to-cook-foods'
  | 'packaged-canned-foods'
  | 'snacks-sweets'
  | 'drinks-beverages'
  | 'dairy-eggs'
  | 'household-essentials'
  // Legacy categories for backward compatibility
  | 'grains-rice'
  | 'spices'
  | 'frozen'
  | 'snacks'
  | 'beverages'

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId
  vendorId: mongoose.Types.ObjectId
  storeId: mongoose.Types.ObjectId
  name: string
  description: string
  category: ProductCategory
  price: number
  unit: string
  image: string
  stock: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProduct>(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: [
        'fresh-produce',
        'tubers-roots',
        'fresh-vegetables',
        'fresh-fruits',
        'fresh-meat',
        'fresh-fish-seafood',
        'smoked-dried-fish-meat',
        'frozen-foods',
        'rice-grains',
        'flour-meal',
        'beans-lentils-pulses',
        'spices-seasonings',
        'sauces-pastes',
        'cooking-oils-fats',
        'noodles-pasta',
        'ready-to-cook-foods',
        'packaged-canned-foods',
        'snacks-sweets',
        'drinks-beverages',
        'dairy-eggs',
        'household-essentials',
        // Legacy categories
        'grains-rice',
        'spices',
        'frozen',
        'snacks',
        'beverages',
      ],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      default: 'each',
    },
    image: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

ProductSchema.index({ vendorId: 1 })
ProductSchema.index({ storeId: 1 })
ProductSchema.index({ category: 1 })
ProductSchema.index({ isActive: 1 })
ProductSchema.index({ name: 'text', description: 'text' })

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)
export default Product
