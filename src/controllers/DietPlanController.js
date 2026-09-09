import DietPlan from '../models/DietPlan.js';
import * as ERRORS from '../utils/errors.js';

export const getAllDiets = async (req, res) => {
  const userId = req.userId;

  const diets = await DietPlan.find(
    { userId: { $in: userId } },
    {},
    { sort: { createdAt: -1 } },
  )
    .populate({ path: 'userId', select: ['_id'], populate: { path: 'config' } })
    .populate({ path: 'planByDay.portions', populate: { path: 'foodId' } })
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
    .populate({ path: 'userId', select: ['_id'], populate: { path: 'config' } })
    .populate({ path: 'planByDay.portions.foodId' })
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
    userId: req.userId,
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
  ).exec();
  // .then(async diet => {
  //   recalcFood(diet, update).then(() => {
  //     res.json({
  //       resultCode: 0,
  //     });
  //   });
  // });
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

  // 1. Находим план питания по ID
  const dietPlan = await DietPlan.findById(dietPlanId)
    .populate({ path: 'userId', select: ['_id'], populate: { path: 'config' } })
    .populate({ path: 'planByDay.portions.foodId' });

  if (!dietPlan) {
    throw new Error('План питания не найден');
  }

  // 2. Находим нужный день в массиве planByDay
  const dayPlan = dietPlan.planByDay.find(d => d.day === Number(day));
  console.log(dayPlan.portions, foodId)
  dayPlan.portions = dayPlan.portions.filter(p => p.foodId.id !== foodId)
  console.log(dayPlan.portions)
  // 3. Сохраняем документ в базу данных
  await dietPlan.save();

  res.json({
    resultCode: 0,
  });
};

export const updateWeight = async (req, res) => {
  const dietPlanId = req.id;
  const foodId = req.foodId;
  const currentDay = req.currentDay;
  const meal = req.meal;
  const newVal = req.newVal;
  const dayRating = req.stat;

  let commonRating = 0;

  if (dayRating) {
    commonRating = dayRating.reduce((acc, curr) => acc + curr.rating, 0) / dayRating.length;
  }

  // 1. Находим план питания по ID
  const dietPlan = await DietPlan.findById(dietPlanId)
    .populate({ path: 'userId', select: ['_id'], populate: { path: 'config' } })
    .populate({ path: 'planByDay.portions.foodId' });

  if (!dietPlan) {
    throw new Error('План питания не найден');
  }

  // 2. Находим нужный день в массиве planByDay
  const dayPlan = dietPlan.planByDay.find(d => d.day === Number(currentDay));

  if (dayPlan) {
    // Обновляем рейтинг дня в любом случае
    dayPlan.dayRating = commonRating;

    // 3. Ищем, есть ли уже порция с таким foodId
    const portionByFoodId = dayPlan.portions.find(p => p.foodId.id.toString() === foodId.toString()).portion;

    if (portionByFoodId) {
      // 4. Ищем, есть ли уже порция с таким meal
      const existingPortion = portionByFoodId.find(p => p.meal === meal);

      if (existingPortion) {
        // ОБНОВЛЕНИЕ: если нашли, правим поля
        existingPortion.weightG = Number(newVal);
      } else {
      // СОЗДАНИЕ: если не нашли, добавляем новую порцию в массив
        portionByFoodId.push({
          meal: meal,
          weightG: Number(newVal),
        });
      }
    }

    // 5. Сохраняем документ в базу данных
    await dietPlan.save();

    return dietPlan;
  }
}

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
