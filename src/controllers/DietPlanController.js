import DietPlan from '../models/DietPlan.js';
import * as ERRORS from '../utils/errors.js';

export const getAllDiets = async (req, res) => {
  const userId = req.userId;

  const diets = await DietPlan.find(
    { author: { $in: userId } },
    {},
    { sort: { createdAt: -1 } },
  )
    .populate({ path: 'author' })
    .exec();

  res.json({
    resultCode: 0,
    data: diets,
    totalCount: diets.length,
  });
};


export const getOneDiet = async (req, res) => {
  const dietId = req.params.id;
  console.log(req.params);

  DietPlan.findOne({ _id: dietId })
    .populate({ path: 'author' })
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
