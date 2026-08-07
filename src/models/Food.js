import mongoose from 'mongoose';

const FoodSchema = new mongoose.Schema({
  name: String,
  statOn100: {
    cal: Number,
    proteins: Number,
    fats: Number,
    carb: Number,
    otherNutrients: Object,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

export default mongoose.model('Food', FoodSchema);
