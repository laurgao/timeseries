import { GetServerSideProps } from "next";
import { getSession } from "next-auth/client";
import Skeleton from "react-loading-skeleton";
import useSWR, { SWRResponse } from "swr";
import Container from "../components/headless/Container";
import H1 from "../components/headless/H1";
import Note from "../components/Note";
import SEO from "../components/SEO";
import { UserModel } from "../models/User";
import cleanForJSON from "../utils/cleanForJSON";
import dbConnect from "../utils/dbConnect";
import fetcher from "../utils/fetcher";
import { DatedObj, NoteObjGraph, UserObj } from "../utils/types";

export default function Home(props: { user: DatedObj<UserObj> }) {
    const { data: notesData, error: notesError }: SWRResponse<{ data: DatedObj<NoteObjGraph>[] }, any> = useSWR(
        `/api/note?isHomePage=true`,
        fetcher
    );

    return (
        <>
            <SEO />
            <Container width="xl">
                <>
                    <div className="mb-16 text-center">
                        <H1>Timeseries</H1>
                        <p className="text-gray-400">Click on a series to see how other people use them!</p>
                    </div>
                    {notesData && notesData.data ? (
                        notesData.data.length > 0 ? (
                            notesData.data.map((note) => <Note key={note._id} note={note} includeSubtitle />)
                        ) : (
                            <p>No notes.</p>
                        )
                    ) : (
                        <Skeleton count={2} />
                    )}
                </>
            </Container>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);
    if (!session) return { props: { user: null } };

    try {
        await dbConnect();
        const thisUser = await UserModel.findOne({ email: session.user.email });
        return { props: { user: cleanForJSON(thisUser) } };
    } catch (e) {
        console.log(e);
        return { notFound: true };
    }
};
