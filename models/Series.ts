import mongoose, {Document, Model} from "mongoose";
import {SeriesObj} from "../utils/types";

interface SeriesDoc extends SeriesObj, Document {}

const SeriesSchema = new mongoose.Schema({
	title: { required: true, type: String }, 
	userId: { required: true, type: mongoose.Schema.Types.ObjectId }, 
	privacy: { required: true, type: String }, 
}, {
	timestamps: true,
});

export const SeriesModel = mongoose.models.series || mongoose.model<SeriesDoc>("series", SeriesSchema);
