const mongoose = require('mongoose');

const dataPointSchema = new mongoose.Schema({
    x: { 
        type: Number, 
        required: true 
    },
    y: { 
        type: Number, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('DataPoint', dataPointSchema);