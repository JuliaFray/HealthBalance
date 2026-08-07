import mongoose from 'mongoose';

const DiarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  day: Date,
  portions: [{
    foodId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Food',
      required: true,
    },
    meal: String,
    weightG: Number,
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

export default mongoose.model('Diary', DiarySchema);
