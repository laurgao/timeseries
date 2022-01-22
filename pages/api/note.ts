import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import { NoteModel } from "../../models/Note";
import { SeriesModel } from "../../models/Series";
import { UserModel } from "../../models/User";
import cleanForJSON from "../../utils/cleanForJSON";
import dbConnect from "../../utils/dbConnect";
const mongoose = require("mongoose")

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "GET": {
            if (!(req.query.seriesId || req.query.body || req.query.date || req.query.isHomePage)) {
                return res.status(406).send("No seriesId, body, or date provided in query.");
            }

            try {
                let conditions = {};

                if (req.query.id) conditions["_id"] = req.query.id;
                if (req.query.seriesId) conditions["seriesId"] = mongoose.Types.ObjectId(req.query.seriesId);
                if (req.query.body) conditions["body"] = req.query.body;
                if (req.query.date) conditions["date"] = req.query.date;

                let pipeline = []
                if (req.query.isHomePage) {
                    pipeline.push({
                        $lookup: {
                            from: "series",
                            let: { "seriesId": "$seriesId" },
                            pipeline: [
                                { $match: { $expr: { $eq: ["$_id", "$$seriesId"] } } },
                                {
                                    $lookup: {
                                        from: "users",
                                        localField: "userId",
                                        foreignField: "_id",
                                        as: "user",
                                    }
                                },
                                { $unwind: "$user" },
                            ],
                            as: "series",
                        }
                    }
                    )
                    pipeline.push({ $unwind: "$series" })
                }

                await dbConnect();

                const thisObject = await NoteModel.aggregate([
                    { $match: conditions },
                    ...pipeline,
                    { $sort: { "date": -1 } },
                ]);

                if (!thisObject || !thisObject.length) return res.status(404).json({ data: [] });

                return res.status(200).json({ data: cleanForJSON(thisObject) });
            } catch (e) {
                return res.status(500).json({ message: e });
            }
        }

        case "POST": {
            const session = await getSession({ req });
            try {
                await dbConnect();

                if (req.body.id) {
                    if (!(req.body.body || req.body.date)) {
                        return res.status(406).send("No body or date to be updated.");
                    }
                    const thisObject = await NoteModel.findById(req.body.id);
                    if (!thisObject) return res.status(404).send("No note with this ID.");

                    if (req.body.body) thisObject.body = req.body.body;
                    if (req.body.date) thisObject.date = req.body.date;

                    await thisObject.save();

                    return res.status(200).json({ message: "Note updated 😜" });
                } else {
                    if (!(req.body.body && req.body.date && req.body.seriesId)) {
                        return res.status(406).send("Must provide a seriesId, body, date to create a note.");
                    }

                    const thisSeries = await SeriesModel.findById(req.body.seriesId);
                    if (!thisSeries) return res.status(404).send("No series with this ID.");
                    if (!session && thisSeries.privacy !== "publicCanEdit") return res.status(403).send("You do not have permission to create this note.");

                    const newNote = await NoteModel.create({
                        seriesId: mongoose.Types.ObjectId(req.body.seriesId.toString()),
                        body: req.body.body,
                        date: req.body.date,
                    });

                    return res.status(200).json({ message: "Note created 😜", id: newNote._id.toString() });
                }
            } catch (e) {
                return res.status(500).json({ message: e });
            }
        }

        case "DELETE": {
            const session = await getSession({ req });
            if (!session) return res.status(403);

            if (!req.body.id) return res.status(406);

            try {
                await dbConnect();

                const thisNote = (await NoteModel.aggregate([
                    { $match: { _id: mongoose.Types.ObjectId(req.body.id.toString()) } },
                    {
                        $lookup: {
                            from: "series",
                            localField: "seriesId",
                            foreignField: "_id",
                            as: "seriesItem",
                        }
                    },
                    { $unwind: "$seriesItem" },
                ]))[0];

                if (!thisNote) return res.status(404);
                const user = await UserModel.findOne({ email: session.user.email })

                if (thisNote.seriesItem.userId.toString() !== user._id.toString()) return res.status(403).send("You do not have permission to delete this note.");

                await NoteModel.deleteOne({ _id: req.body.id });

                return res.status(200).json({ message: "Note deleted 😜" });
            } catch (e) {
                return res.status(500).json({ message: e });
            }
        }

        default:
            return res.status(405);
    }
}
