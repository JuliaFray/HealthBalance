import Dialog from "../models/Dialog.js";
import Message from "../models/Message.js";

export const getAllDialogs = async (req, res) => {
    const userId = req.userId;

    const dialogs = await Dialog.find(
        {users: {$in: [userId]}},
        {},
        {sort: {createdAt: -1}}
    )
        .populate({path: 'users', populate: {path: 'avatar'}})
        .exec();

    res.json({
        resultCode: 0,
        data: dialogs
    });
}

export const getMessagesByDialog = async (req, res) => {
    const dialogId = req.params.id;

    const messages = await Message
        .find(
            {dialog: {$in: [dialogId]}},
            {},
            {sort: {createdAt: 1}}
        )
        .populate({path: 'from', populate: {path: 'avatar'}})
        .limit(50)
        .exec();

    res.json({
        resultCode: 0,
        data: messages
    });
}

export const saveMessage = async (req, res) => {
    let promise;
    if (!req.dialogId) {
        promise = Dialog.findOne({
            users: [req.to, req.from],
            isPrivate: true
        })
            .exec()
            .then(dialog => {
                if (dialog) {
                    return dialog
                } else {
                    return new Dialog({
                        users: [req.to, req.from],
                        isPrivate: true
                    })
                        .save()
                }
            })
    } else {
        promise = Dialog.findOneAndUpdate(
            {_id: req.dialogId},
            {$set: {users: [req.to, req.from], isPrivate: true}},
            {upsert: true})
            .exec();
    }

    return promise
        .then(dialog => {
            return new Message({
                from: req.from,
                to: req.to,
                text: req.text,
                dialog: dialog._id
            }).save()
        })
        .then(msg => msg.populate({path: 'from', populate: {path: 'avatar'}}));
}
