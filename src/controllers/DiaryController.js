import { ObjectId } from 'mongodb';

import Diary from '../models/Diary.js';

export const getDiaryByDate = async (req, res) => {
  const userId = req.userId;
  const date = req.query['date'];

  const diaryRec = await Diary.findOne(
    { $and: [{ userId: { $in: userId } }, { day: { $in: new Date(date) } }] },
  )
    .populate({ path: 'userId', select: ['_id'], populate: { path: 'config' } })
    .populate({ path: 'portions.foodId' })
    .exec();

  res.json({ data: diaryRec });
};

export const addFoodToDiary = async (req, res) => {
  const userId = req.userId;
  const data = req.body;
  const date = data.date;

  let diaryRec = await Diary.findOne(
    { $and: [{ userId: { $in: userId } }, { day: { $in: new Date(date) } }] },
  )
    .populate({ path: 'userId', select: ['_id'], populate: { path: 'config' } })
    .populate({ path: 'portions.foodId' });

  const portions = data.foods.map(food => ({
    foodId: new ObjectId(food.id),
    portion: [{
      meal: food.meals[0].meal,
      weightG: food.meals[0].weightG,
    }],
  }));

  if (diaryRec) {
    diaryRec.portions.push(...portions);
  } else {
    diaryRec = new Diary({
      userId: new ObjectId(userId),
      day: date,
      portions: portions,
    });
  }

  diaryRec.save();

  res.json({
    resultCode: 0,
    data: diaryRec,
  });
};

export const getFilledDates = async (req, res) => {
  const userId = req.userId;

  const dates = await Diary.distinct('day', { userId: userId });

  res.json({
    data: dates,
  });
};

const calculate = (diaryPortion) => {
  const summWeight = diaryPortion.portion.reduce((sum, el) => sum + el.weightG, 0) / 100;

  return {
    calories: diaryPortion.foodId.nutrients.calories * summWeight,
    proteins: diaryPortion.foodId.nutrients.proteins * summWeight,
    fats: diaryPortion.foodId.nutrients.fats * summWeight,
    carbs: diaryPortion.foodId.nutrients.carbs * summWeight,
  };
};

export const getDayStat = async (req, res) => {
  const userId = req.userId;
  const date = req.query['date'];

  const diaryRec = await Diary.findOne(
    { $and: [{ userId: { $in: userId } }, { day: { $in: new Date(date) } }] },
  )
    .populate({ path: 'userId', select: ['_id'], populate: { path: 'config' } })
    .populate({ path: 'portions.foodId' });

  const stats = diaryRec.portions.map(portion => calculate(portion)).reduce((sum, el) => ({
    ...sum,
    calories: sum.calories + el.calories,
    proteins: sum.proteins + el.proteins,
    fats: sum.fats + el.fats,
    carbs: sum.carbs + el.carbs,
  }), {
    calories: 0,
    proteins: 0,
    fats: 0,
    carbs: 0,
  });

  res.json({
    data: stats,
  });
};


export const removeFood = async (req, res) => {
  const userId = req.userId;
  const foodId = req.body.foodId;
  const date = req.body.day;

  // 1. Находим план питания по ID
  const diaryRec = await Diary.findOne(
    { $and: [{ userId: { $in: userId } }, { day: { $in: new Date(date) } }] },
  )
    .populate({ path: 'userId', select: ['_id'], populate: { path: 'config' } })
    .populate({ path: 'portions.foodId' });

  if (!diaryRec) {
    throw new Error('План питания не найден');
  }

  // 2. Находим нужный день в массиве planByDay
  diaryRec.portions = diaryRec.portions.filter(p => p.foodId.id !== foodId);

  // 3. Сохраняем документ в базу данных
  await diaryRec.save();

  res.json({
    resultCode: 0,
  });
};
