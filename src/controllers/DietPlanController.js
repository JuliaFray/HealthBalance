import DietPlan from '../models/DietPlan.js';
import * as ERRORS from '../utils/errors.js';

export const getAllDiets = async (req, res) => {
  const userId = req.userId;

  const diets = await DietPlan.find(
    { author: { $in: userId } },
    {},
    { sort: { createdAt: -1 } },
  )
    .populate({ path: 'author', select: ['_id'], populate: { path: 'healthInfo' } })
    .exec();

  res.json({
    resultCode: 0,
    data: diets,
    totalCount: diets.length,
  });
};

export const getOneDiet = async (req, res) => {
  const dietId = req.params.id;

  DietPlan.findOne({ _id: dietId })
    .populate({ path: 'author', select: ['_id'], populate: { path: 'healthInfo' } })
    .then((diet) => {
      if (!diet) {
        res.status(404).json({
          error: ERRORS.NOT_FOUND,
          resultCode: 1,
        });
        return;
      }
      res.json({
        data: diet,
        resultCode: 0,
      });
    }).catch(err => {
      console.error(err);
      res.status(400).json({
        error: ERRORS.UNDEFINED_ERROR,
        resultCode: 1,
      });
    });
};

export const createPlan = async (req, res) => {
  const doc = new DietPlan({
    meals: req.body.meals,
    period: req.body.period,
    author: req.userId,
    name: req.body.name,
  });

  const newDiet = await doc.save();

  res.json({
    resultCode: 0,
    data: newDiet,
  });
};

const recalcFood = async (diet, updateBody) => {
  if (updateBody) {
    diet.foods = diet.foods.map(food => {
      food.days = food.days.filter(day => Number(day.day) <= Number(updateBody.period)).map(day => {
        day.meals = day.meals.filter(meal => updateBody.meals.includes(meal.meal));
        if (updateBody.meals.length > day.meals.length) {
          const newMeals = [];
          updateBody.meals.filter(meal => !day.meals.flatMap(meal => meal.meal).includes(meal))
            .forEach(meal => {
              newMeals.push({ meal, volume: 0 });
            });

          if (newMeals.length) {
            day.meals.push(...newMeals);
          }
        }
        return day;
      }).filter(day => !!day.meals.length);

      return food;
    }).filter(food => !!food.days.length);
  } 
  diet.foods = diet.foods.map(food => {
    food.days = food.days.map(day => {
      if (day.meals.every(meal => meal.volume === 0)) {
        day.meals = [];
      }
      return day;
    }).filter(day => !!day.meals.length);

    return food;
  }).filter(food => !!food.days.length);

  await diet.save();

  return diet;
};

export const updateDietPlan = async (req, res) => {
  const dietPlanId = req.params.id;

  const update = req.body;

  await DietPlan.findOneAndUpdate(
    { _id: dietPlanId },
    {
      name: update.name,
      period: update.period,
      meals: update.meals,
    },
    { upsert: true },
  ).exec()
    .then(async diet => {
      recalcFood(diet, update).then(() => {
        res.json({
          resultCode: 0,
        });
      });
    });
};

export const addFood = async (req, res) => {
  const dietPlanId = req.params.id;

  const body = req.body;

  const newFood = body?.map(it => ({
    name: it.name,
    days: [{
      day: it.day,
      meals: it.meals.map(meal => ({
        meal,
        volume: 0,
      })),
    }],
    stat: {
      cal: it.cal,
      proteins: it.proteins,
      fats: it.fats,
      carb: it.carb,
      otherNutrients: it.otherNutrients,
    },
  }));

  if (newFood && newFood.length > 0) {
    await DietPlan.findOneAndUpdate(
      { _id: dietPlanId },
      { $push: { foods: newFood } },
      { upsert: true },
    ).exec();
  }

  res.json({
    resultCode: 0,
  });

};

export const removeFood = async (req, res) => {
  const dietPlanId = req.params.id;
  const foodId = req.body.foodId;
  const day = req.body.day;

  await DietPlan.findByIdAndUpdate(
    dietPlanId,
    {
      $pull: {
        'foods.$[foodIdx].days': { 'day': day },
      },
    },
    {
      arrayFilters: [
        { 'foodIdx._id': foodId },
      ],
      new: true,
    },
  )
    .exec()
    .then(() => {
      res.json({
        resultCode: 0,
      });
    });
};

export const updateWeight = async (req, res) => {
  const dietPlanId = req.id;
  const foodId = req.foodId;
  const currentDay = req.currentDay;
  const meal = req.meal;
  const newVal = req.newVal;

  return await DietPlan.findByIdAndUpdate(
    dietPlanId,
    {
      $set: {
        'foods.$[foodIdx].days.$[dayIdx].meals.$[mealIdx].volume': Number(newVal),
        'foods.$[foodIdx].days.$[dayIdx].meals.$[mealIdx].meal': meal,
      },
    },
    {
      arrayFilters: [
        { 'foodIdx._id': foodId },
        { 'dayIdx.day': currentDay },
        { 'mealIdx.meal': meal },
      ],
      new: true,
    },
  )
    .populate({ path: 'author', select: ['_id'], populate: { path: 'healthInfo' } })
    .exec();
};


export const deleteDietPlan = async (req, res) => {
  const dietPlanId = req.params.id;

  DietPlan.findOneAndDelete(
    { _id: dietPlanId },
  ).then(diet => {
    if (diet) {
      res.json({
        resultCode: 0,
      });
    } else {
      res.status(404).json({
        resultCode: 1,
        message: ERRORS.NOT_FOUND,
      });
    }
  }).catch(err => {
    console.log(err);
    res.status(400).json({
      resultCode: 1,
      message: ERRORS.UNDEFINED_ERROR,
    });
  });
};
