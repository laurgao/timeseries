import { GetServerSideProps } from "next";
import { getSession } from "next-auth/client";
import { ssrRedirect } from "next-response-helpers";
import { UserModel } from "../models/User";
import dbConnect from "../utils/dbConnect";

export default function Home() {
    return <></>
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);
    if (!session) return ssrRedirect("/auth/signin");

    try {
        await dbConnect();
        const thisUser = await UserModel.findOne({ email: session.user.email });
        return thisUser ? ssrRedirect(`/${thisUser.userName}`) : ssrRedirect("/auth/newaccount");
    } catch (e) {
        console.log(e);
        return { notFound: true };
    }
};
