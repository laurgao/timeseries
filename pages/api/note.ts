import {NoteObj} from "../../utils/types";
import {NoteModel} from "../../models/Note";
import dbConnect from "../../utils/dbConnect";
import {NextApiRequest, NextApiResponse} from "next";
import {getSession} from "next-auth/client";
import { UserModel } from "../../models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {    
        case "GET": {
            if (!(req.query.user || req.query.body || req.query.date)) {
                return res.status(406).send("No user, body, or date provided in query.");                        
            }
            
            try {                
                let conditions = {};

                if (req.query.id) conditions["_id"] = req.query.id;
                if (req.query.user) conditions["user"] = req.query.user;
                if (req.query.body) conditions["body"] = req.query.body;
                if (req.query.date) conditions["date"] = req.query.date;
                
                await dbConnect();   
            
                const thisObject = await NoteModel.aggregate([
                    {$match: conditions},
                    {$sort: {"date": -1}},
                ]);
                
                if (!thisObject || !thisObject.length) return res.status(404);
                
                return res.status(200).json({data: thisObject});
            } catch (e) {
                return res.status(500).json({message: e});                        
            }
        }
            
        case "POST": {
            const session = await getSession({ req });
            if (!session) return res.status(403);
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
                    
                    return res.status(200).json({message: "Note updated 😜"});                            
                } else {
                    if (!(req.body.body && req.body.date)) {
                        return res.status(406).send("Must provide a body and date to create a note.");          
                    }

                    const user = await UserModel.findOne({email: session.user.email})
                    
                    const newNote = new NoteModel({
                        user: user._id,
                        body: req.body.body,
                        date: req.body.date,                             
                    });
                    
                    const savedNote = await newNote.save();
                    
                    return res.status(200).json({message: "Note created 😜", id: savedNote._id.toString()});
                }            
            } catch (e) {
                return res.status(500).json({message: e});            
            }
        }
        
        case "DELETE": {
            const session = await getSession({ req });
            if (!session) return res.status(403);
            
            if (!req.body.id) return res.status(406);
            
            try {
                await dbConnect();
                               
                const thisObject = await NoteModel.findById(req.body.id);
                
                if (!thisObject) return res.status(404);
                const user = await UserModel.findOne({email: session.user.email})

                if (thisObject.user.toString() !== user._id.toString()) return res.status(403);
                
                await NoteModel.deleteOne({_id: req.body.id});
                
                return res.status(200).json({message: "Note deleted 😜"});
            } catch (e) {
                return res.status(500).json({message: e});
            }
        }
        
        default:
            return res.status(405);
    }
}
