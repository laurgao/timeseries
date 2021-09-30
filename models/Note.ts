import mongoose, {Document, Model} from "mongoose";
import {DatedObj, NoteObj} from "../utils/types";


export const NoteModel: Model<DatedObj<NoteObj>> = mongoose.models.note || mongoose.model("note", new mongoose.Schema({
    body: { required: true, type: String },
    date: { required: true, type: String },
    user: { required: true, type: String },
}, {
    timestamps: true,
}));