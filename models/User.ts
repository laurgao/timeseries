import mongoose, { Document } from "mongoose";
import { UserObj } from "../utils/types";

interface SeriesDoc extends UserObj, Document {}
const UserSchema = new mongoose.Schema(
    {
        email: { required: true, type: String },
        name: { required: true, type: String },
        image: { required: true, type: String },
        username: { required: true, type: String },
    },
    {
        timestamps: true,
    }
);

export const UserModel = mongoose.models.user || mongoose.model<SeriesDoc>("user", UserSchema);
