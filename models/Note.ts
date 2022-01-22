import mongoose, { Model } from "mongoose";
import { DatedObj, NoteObj } from "../utils/types";


export const NoteModel: Model<DatedObj<NoteObj>> = mongoose.models.note || mongoose.model("note", new mongoose.Schema({
    body: { required: true, type: String },
    date: { required: true, type: String },
    seriesId: {required: true, type: mongoose.Schema.Types.ObjectId},
}, {
    timestamps: true,
}));