const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdpotSchema = new Schema({
        description: {
            type: String,
            required: true
        },
        image: {
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

const Adoption = mongoose.model('Adoption', AdpotSchema);

module.exports = Adoption;