import { GetServerSideProps } from "next";
import { getSession } from "next-auth/client";
import { ssr404, ssrRedirect } from "next-response-helpers";
import { UserModel } from "../models/User";
import dbConnect from "../utils/dbConnect";

export default function ProfileRedirect({}: {}) {
    return <></>;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    if (!session) return ssrRedirect("/auth/welcome");

    try {
        await dbConnect();

        const thisUser = await UserModel.findOne({ email: session.user.email });

        if (!thisUser) return ssrRedirect("/auth/newaccount");

        return ssrRedirect(`/${thisUser.username}`);
    } catch (e) {
        console.log(e);
        return ssr404;
    }
};
