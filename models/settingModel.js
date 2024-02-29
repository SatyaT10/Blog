const mongoose = require("mongoose");

const settingShema = new mongoose.Schema({
    post_limit: {
        type: Number,
        required: true
    }
});


module.exports = mongoose.model('Setting', settingShema);