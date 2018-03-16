const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LostSchema = new Schema({
        image: {
            type: String
        },
        location: {
            type: String
        },
        owner: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

const LostFound = mongoose.model('LostFound', LostSchema);

module.exports = LostFound;

