import mongoose from 'mongoose';

const DietPlanSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'Profile',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    period: {
        type: Number,
        required: true
    },
    meals: {
        type: [Number],
        required: true
    },
    stats: {
        plan: {
            cal: {
                type: Number,
                required: true
            },
            proteins: {
                type: Number,
                required: true
            },
            fats: {
                type: Number,
                required: true
            },
            carb: {
                type: Number,
                required: true
            },
        },
        fact: {
            cal: {
                type: Number,
                required: true
            },
            proteins: {
                type: Number,
                required: true
            },
            fats: {
                type: Number,
                required: true
            },
            carb: {
                type: Number,
                required: true
            },
        },
        rating: {
            type: Number,
            required: true
        }
    }
}, {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

export default mongoose.model('DietPlan', DietPlanSchema);
