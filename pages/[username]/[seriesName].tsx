import { GetServerSideProps } from "next";
import { getSession } from "next-auth/client";
import { res404 } from "next-response-helpers";
import React from "react";
import Container from "../../components/headless/Container";
import H1 from "../../components/headless/H1";
import NoteFeed from "../../components/NoteFeed";
import SEO from "../../components/SEO";
import A from "../../components/style/A";
import { SeriesModel } from "../../models/Series";
import { UserModel } from "../../models/User";
import cleanForJSON from "../../utils/cleanForJSON";
import dbConnect from "../../utils/dbConnect";
import { DatedObj, SeriesObj, UserObj } from "../../utils/types";
import { caseInsensitiveRegex } from "../../utils/utils";

const TimeseriesPage = (props: { thisSeries: DatedObj<SeriesObj & { user: UserObj }>; isOwner: boolean }) => {
    const canView = props.thisSeries.privacy !== "private" || props.isOwner;
    return (
        <>
            <SEO />
            <Container width="xl">
                {/* mb make this a PageHeader component bc it's already used on like 3 pages */}
                <div className="mb-8 text-center">
                    <H1>{props.thisSeries.title}</H1>
                    <p className="text-gray-400">
                        By <A href={`/${props.thisSeries.user.username}`}>{"@" + props.thisSeries.user.username}</A>
                    </p>
                </div>
                {canView ? <NoteFeed {...props} /> : <p>This is a private timeseries and you do not have permission to view its notes.</p>}
            </Container>
        </>
    );
};

export default TimeseriesPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { username, seriesName } = context.params;
    const session = await getSession(context);

    if (Array.isArray(seriesName)) return res404;

    try {
        await dbConnect();

        const thisSeries = (
            await SeriesModel.aggregate([
                { $match: { title: caseInsensitiveRegex(seriesName) } },
                {
                    $lookup: {
                        from: "users",
                        let: { userId: "$userId" },
                        pipeline: [
                            {
                                $match: {
                                    $and: [{ $expr: { $eq: ["$_id", "$$userId"] } }, { $expr: { $eq: ["$username", username] } }],
                                },
                            },
                        ],
                        as: "user",
                    },
                },
                { $unwind: "$user" },
            ])
        )[0];
        if (!thisSeries) return { notFound: true };

        const sessionUser = session ? await UserModel.findOne({ email: session.user.email }) : null;

        const isOwner = session && sessionUser && sessionUser._id.toString() === thisSeries.userId.toString();
        return { props: { thisSeries: cleanForJSON(thisSeries), isOwner: isOwner } };
    } catch (e) {
        console.log(e);
        return { notFound: true };
    }
};
