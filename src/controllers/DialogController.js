import Dialog from "../models/Dialog.js";

export const getAllDialogs = async (req, res) => {
    const userId = req.params.id;

    const messages = await Dialog.find(
        {user: {$in: userId}},
        {},
        {sort: {createdAt: -1}}
    )
        .exec();

    res.json({
        resultCode: 0,
        data: messages
    });
}
