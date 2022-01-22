import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import { UserModel } from "../../models/User";
import cleanForJSON from "../../utils/cleanForJSON";
import dbConnect from "../../utils/dbConnect";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {    
        case "GET": {
            try {
                await dbConnect();
                const session = await getSession({ req });
                if (!session) return res.status(403).send("Not logged in.");
                const thisUser = await UserModel.findOne({email: session.user.email});
                if (!thisUser) return res.status(404).send("No user with this email.");
                return res.status(200).json({data: cleanForJSON(thisUser)});
            } catch (e) {
                return res.status(500).json({message: e});
            }
        }
            
    default:
        return res.status(405);
    }
}   
