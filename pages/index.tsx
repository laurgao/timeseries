import { GetServerSideProps } from "next";
import { getSession } from "next-auth/client";
import Link from "next/link";
import Skeleton from "react-loading-skeleton";
import useSWR, { SWRResponse } from "swr";
import Container from "../components/headless/Container";
import H1 from "../components/headless/H1";
import H2 from "../components/headless/H2";
import SEO from "../components/SEO";
import { UserModel } from "../models/User";
import cleanForJSON from "../utils/cleanForJSON";
import dbConnect from "../utils/dbConnect";
import fetcher from "../utils/fetcher";
import { DatedObj, NoteObj, SeriesObj, UserObj } from "../utils/types";

type NoteObjGraph = NoteObj & { series: SeriesObj & { user: UserObj } };

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
                        <p className="text-gray-400">The latest notes across the platform</p>
                    </div>
                    {notesData && notesData.data ? (
                        notesData.data.length > 0 ? (
                            notesData.data.map((note) => (
                                <div className="mb-16" key={note._id}>
                                    <div className="text-center mb-4">
                                        <H2>{note.date}</H2>
                                        <p className="text-sm text-gray-400">
                                            Series:{" "}
                                            <a className="underline">
                                                <Link href={`/${note.series.user.username}/${note.series.title.toLowerCase()}`}>
                                                    {note.series.title}
                                                </Link>
                                            </a>
                                        </p>
                                    </div>
                                    <pre>{note.body}</pre>
                                </div>
                            ))
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
