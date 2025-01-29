import DietPlan from '../models/DietPlan.js';
import {getToken} from './FatSecretController.js';

export const getAllDiets = async (req, res) => {
    const userId = req.userId;

    const diets = await DietPlan.find(
        {author: {$in: userId}},
        {},
        {sort: {createdAt: -1}}
    )
        .populate({
            path: 'author', populate: {path: 'avatar'},
            select: (['-__v', '-age', '-city', '-status', '-contacts'])
        })
        .exec();

    res.json({
        resultCode: 0,
        data: diets,
        totalCount: diets.length
    });
}

export const createPlan = async (req, res) => {
    const doc = new DietPlan({
        meals: req.body.meals,
        period: req.body.period,
        author: req.userId,
        name: req.body.name
    });

    const newDiet = await doc.save();

    res.json({
        resultCode: 0,
        data: newDiet
    });
}
