import mongoose from 'mongoose';

const DietPlanSchema = new mongoose.Schema({
  author: {
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
  stats: {
    plan: {
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
    },
    fact: {
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
    },
    rating: {
      type: Number,
      required: true,
    },
  },
  foods: [{
    name: String,
    days: [{
      day: Number,
      meals: [{
        meal: String,
        volume: Number,
      }],
    }],
    stat: {
      cal: Number,
      proteins: Number,
      fats: Number,
      carb: Number,
      otherNutrients: Object,
    },

  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

export default mongoose.model('DietPlan', DietPlanSchema);
