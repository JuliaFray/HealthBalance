import mongoose from 'mongoose';
import PostUser from "./PostUser.js";
import Comment from "./Comment.js";

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    tags: {
        type: Array,
        default: []
    },
    imageId: {
        type: mongoose.Schema.ObjectId
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'Profile',
        required: true
    },
    viewsCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

PostSchema.virtual('likes', {
    ref: 'PostUser',
    localField: '_id',
    foreignField: 'post',
    count: true
})

PostSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'post'
})

PostSchema.pre('findOneAndDelete',
    {document: true, errorHandler: true},
    async (error, post, next
    ) => {
        await PostUser.deleteMany({post: post._id})
            .then(() => {
                console.log('likes were deleted');
                Comment.deleteMany({post: post._id})
                    .then(() => {
                        console.log('Comment were deleted');
                        next();
                    })
            })
            .catch(err => next(new Error(err)));
    });

export default mongoose.model('Post', PostSchema);
