const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MapSchema = new Schema ({
  address: {type: String},
  lostId: { type: Schema.Types.ObjectId }
});

MapSchema.index({ location: '2dsphere' });

const MapThings =  mongoose.model('MapThings', MapSchema);

module.exports = MapThings;