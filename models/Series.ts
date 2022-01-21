import mongoose, {Model} from "mongoose";
import {SeriesObj} from "../utils/types";

const SeriesSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    title: {type: String, required: true},
    privacy: {type: String, required: true},
}, {
    timestamps: true,
});

export const SeriesModel = (!!mongoose.models && mongoose.models.series as Model<SeriesObj>) || mongoose.model<SeriesObj>("series", SeriesSchema);