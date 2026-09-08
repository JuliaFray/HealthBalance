import mongoose from 'mongoose';

const UserConfig = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  theme: {
    type: String,
    default: 'light',
  },
  locale: {
    type: String,
    default: 'ru',
  },
  gender: String,
  weight: Number,
  height: Number,
  age: Number,
  activityLevel: String,
  goal: String,
  targets: {
    targetWeight: Number,
    targetDate: Date,
    targetWater: Number,
    targetCalories: Number,
    targetProteins: Number,
    targetFats: Number,
    targetCarb: Number,
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});


export default mongoose.model('UserConfig', UserConfig);
