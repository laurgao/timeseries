import {SeriesObj} from "../../utils/types";
import {SeriesModel} from "../../models/Series";
import dbConnect from "../../utils/dbConnect";
import {NextApiRequest, NextApiResponse} from "next";
import {getSession} from "next-auth/client";
import { UserModel } from "../../models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {    
        case "GET": {
            const session = await getSession({ req });
            if (!session) return res.status(403);
            if (!(req.query.title || req.query.userId || req.query.privacy)) {
                return res.status(406);                        
            }
            
            try {                
                let conditions = {};

                if (req.query.id) conditions["_id"] = req.query.id;
                if (req.query.title) conditions["title"] = req.query.title;
                if (req.query.userId) conditions["userId"] = req.query.userId;
                if (req.query.privacy) conditions["privacy"] = req.query.privacy;
                
                         
                await dbConnect();   
            
                const thisSeries = await SeriesModel.aggregate([
                    {$match: conditions},
                    {$skip: (+req.query.page - 1) * 10},
                    {$limit: 10},
                ]);
                
                if (!thisSeries || !thisSeries.length) return res.status(404);
                
                return res.status(200).json({data: thisSeries});
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
                    if (!(req.body.title || req.body.privacy)) {
                        return res.status(406);            
                    }
                    const thisSeries = await SeriesModel.findById(req.body.id);
                    if (!thisSeries) return res.status(404);
                    thisSeries.userId = session.userId;
                    thisSeries.title = req.body.title;
                    thisSeries.privacy = req.body.privacy;
                    
                    await thisSeries.save();
                    
                    return res.status(200).json({message: "Series updated"});                            
                } else {
                    if (!(req.body.title && req.body.privacy)) {
                        return res.status(406);            
                    }

                    const thisUser = await UserModel.findOne({email: session.user.email});

                    const newSeries = await SeriesModel.create({
                        title: req.body.title,
                        userId: thisUser._id,
                        privacy: req.body.privacy,                             
                    });
                    
                    return res.status(200).json({message: "Series created", id: newSeries._id.toString()});
                }            
            } catch (e) {
                return res.status(500).json({message: e});            
            }
        }
        
        
        default:
            return res.status(405);
    }
}
