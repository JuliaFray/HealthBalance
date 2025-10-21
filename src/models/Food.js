import mongoose from 'mongoose';

const FoodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  info: [{
    meals: Number,
    foods: [{
      meals: [{
        meal: Number,
        volume: Number,
      }],
      cal: Number,
      proteins: Number,
      fats: Number,
      carb: Number,
      otherNutrients: Object,
    }],
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

export default mongoose.model('Food', FoodSchema);
