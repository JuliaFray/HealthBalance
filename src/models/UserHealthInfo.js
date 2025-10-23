import mongoose from 'mongoose';

const UserHealthInfoSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
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
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

export default mongoose.model('UserHealthInfo', UserHealthInfoSchema);
