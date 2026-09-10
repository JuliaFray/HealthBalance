import mongoose from 'mongoose';

import Product from './Product.js';

const DietPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  period: {
    type: Number,
    required: true,
  },
  meals: {
    type: [String],
    required: true,
  },
  statResult: {
    calories: {
      type: Number,
      required: true,
    },
    proteins: {
      type: Number,
      required: true,
    },
    fats: {
      type: Number,
      required: true,
    },
    carbs: {
      type: Number,
      required: true,
    },
    planRating: {
      type: Number,
      required: true,
    },
  },
  planByDay: [{
    day: Number,
    dayRating: {
      type: Number,
      required: true,
    },
    portions: [{
      foodId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true,
      },
      portion: [{
        meal: String,
        weightG: Number,
      }],
    }],
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

export default mongoose.model('DietPlan', DietPlanSchema);
