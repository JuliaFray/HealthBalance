import mongoose from 'mongoose';

const DiarySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  day: Date,
  foods: [{
    name: String,
    meals: [{
      meal: String,
      volume: Number,
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

export default mongoose.model('Diary', DiarySchema);
