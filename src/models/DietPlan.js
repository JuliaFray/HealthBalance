import mongoose from 'mongoose';
import UserFriends from './UserFriends.js';
import Food from './Food.js';

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
    cal: {
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
    carb: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
  },
  planByDay: [{
    day: Number,
    portions: [{
      foodId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Food',
        required: true,
      },
      meal: String,
      weightG: Number,
    }],
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// DietPlanSchema.virtual('foods', {
//   ref: Food,
//   localField: 'planByDay.portions.foodId',
//   foreignField: '_id',
// }).get(arr => {
//   return Array.isArray(arr) ? arr.filter(val => val.isAgree) : [];
// });

export default mongoose.model('DietPlan', DietPlanSchema);
