const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LostSchema = new Schema({
        latitude: {
            type: Number
        },
        longitude: {
            type: Number
        },
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
        },
        ownerEmail:{
            type: String
        }
    },
    {
        timestamps: true
    }
);

const LostFound = mongoose.model('LostFound', LostSchema);

module.exports = LostFound;

