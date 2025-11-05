import Diary from '../models/Diary.js';

export const getDiaryByDate = async (req, res) => {
  const userId = req.userId;
  const date = req.query['date'];

  const diets = await Diary.find(
    { $and: [{ author: { $in: userId } }, { day: { $in: new Date(date) } }] },
  )
    .populate({ path: 'author', select: ['_id'], populate: { path: 'healthInfo' } })
    .exec();

  res.json({
    resultCode: 0,
    data: diets,
    totalCount: diets.length,
  });
};
