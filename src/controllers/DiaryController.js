import Diary from '../models/Diary.js';

export const getDiaryByDate = async (req, res) => {
  const userId = req.userId;
  const date = req.query['date'];

  const diets = await Diary.find(
    { $and: [{ userId: { $in: userId } }, { day: { $in: new Date(date) } }] },
  )
    .populate({ path: 'userId', select: ['_id'], populate: { path: 'config' } })
    .exec();

  res.json({
    resultCode: 0,
    data: diets,
    totalCount: diets.length,
  });
};
