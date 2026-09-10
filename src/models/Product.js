import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: String,
  nutrients: {
    calories: Number,
    proteins: Number,
    fats: Number,
    carbs: Number,
    otherNutrients: { type: Object, required: false },
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

export default mongoose.model('Product', ProductSchema);
