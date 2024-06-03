const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ExerciseSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model("Exercise", ExerciseSchema);