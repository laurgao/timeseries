import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import { UserModel } from "../../../models/User";
import dbConnect from "../../../utils/dbConnect";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "POST":
            const session = await getSession({ req });
            if (!session) return res.status(403).send("Unauthed");

            if (!req.body.username) {
                return res.status(400).send("Missing username");
            }

            if (["profile", "index", "auth", "settings", "api"].includes(req.body.username))
                return res.status(200).json({ error: "Invalid username" });

            try {
                await dbConnect();

                const user = await UserModel.findOne({ email: session.user.email });
                if (user) return res.status(200).json({ error: "Account already exists" });
                const usernameUser = await UserModel.findOne({ username: req.body.username });
                if (usernameUser) return res.status(200).json({ error: "This username is already taken." });

                await UserModel.create({
                    email: session.user.email,
                    name: session.user.name,
                    image: session.user.image,
                    username: req.body.username,
                });

                return res.status(200).json({ message: "Account created 😜" });
            } catch (e) {
                return res.status(500).json({ message: e });
            }
        default:
            return res.status(405).send("Invalid method");
    }
}
