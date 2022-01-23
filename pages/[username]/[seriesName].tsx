import axios from "axios";
import { format } from "date-fns";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/client";
import { res404 } from "next-response-helpers";
import Link from "next/link";
import React, { useState } from "react";
import { ContextMenu, ContextMenuTrigger, MenuItem } from "react-contextmenu";
import { FiTrash } from "react-icons/fi";
import Skeleton from "react-loading-skeleton";
import useSWR, { SWRResponse } from "swr";
import Container from "../../components/headless/Container";
import H1 from "../../components/headless/H1";
import H2 from "../../components/headless/H2";
import Input from "../../components/headless/Input";
import NotionButton from "../../components/headless/NotionButton";
import PrimaryButton from "../../components/headless/PrimaryButton";
import SEO from "../../components/SEO";
import { SeriesModel } from "../../models/Series";
import { UserModel } from "../../models/User";
import cleanForJSON from "../../utils/cleanForJSON";
import dbConnect from "../../utils/dbConnect";
import fetcher from "../../utils/fetcher";
import useKey, { waitForEl } from "../../utils/key";
import { DatedObj, NoteObj, SeriesObj, UserObj } from "../../utils/types";
import { caseInsensitiveRegex } from "../../utils/utils";

const TimeseriesPage = ({
    thisSeries,
    canEdit,
    isOwner,
}: {
    thisSeries: DatedObj<SeriesObj & { user: UserObj }>;
    canEdit: boolean;
    isOwner: boolean;
}) => {
    const [addNoteIsOpen, setAddNoteIsOpen] = useState<boolean>(false);
    const [body, setBody] = useState<string>("");
    const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [iter, setIter] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { data: notesData, error: notesError }: SWRResponse<{ data: DatedObj<NoteObj>[] }, any> = useSWR(
        `/api/note?seriesId=${thisSeries._id}&iter=${iter}`,
        fetcher
    );

    function onSubmit() {
        setIsLoading(true);
        axios
            .post("/api/note", { seriesId: thisSeries._id, date: date, body: body })
            .then((res) => {
                console.log(res.data.message);
                setIter(iter + 1);
                setDate(format(new Date(), "yyyy-MM-dd"));
                setBody("");
                setAddNoteIsOpen(false);
            })
            .catch((e) => console.log(e))
            .finally(() => setIsLoading(false));
    }

    function onDelete(noteId: string) {
        setIsLoading(true);
        axios
            .delete(`/api/note`, { data: { id: noteId } })
            .then((res) => {
                console.log(res.data.message);
                setIter(iter + 1);
            })
            .catch((e) => console.log(e))
            .finally(() => setIsLoading(false));
    }

    useKey("KeyN", (e) => {
        if (!addNoteIsOpen) {
            e.preventDefault();
            setAddNoteIsOpen(true);
            waitForEl("new-note-body");
        }
    });

    return (
        <>
            <SEO />
            <Container width="xl">
                <>
                    {/* mb make this a PageHeader component bc it's already used on like 3 pages */}
                    <div className="mb-8 text-center">
                        <H1>{thisSeries.title}</H1>
                        <p className="text-gray-400">
                            By{" "}
                            <Link href={`/${thisSeries.user.username}`}>
                                <a className="underline">{"@" + thisSeries.user.username}</a>
                            </Link>
                        </p>
                    </div>
                    {canEdit && !addNoteIsOpen && (
                        <div className="my-4">
                            <NotionButton
                                onClick={() => {
                                    setAddNoteIsOpen(true);
                                    waitForEl("new-note-body");
                                }}
                            >
                                New note (n)
                            </NotionButton>
                        </div>
                    )}
                    {addNoteIsOpen && (
                        <div className="mb-16">
                            <Input type="date" value={date} setValue={setDate} className="my-8" />
                            <div className="my-8">
                                <Input
                                    type="textarea"
                                    value={body}
                                    setValue={setBody}
                                    id="new-note-body"
                                    placeholder="What were the most interesting events in today's news?"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            if (e.ctrlKey) onSubmit();
                                        } else if (e.key === "Escape") {
                                            setAddNoteIsOpen(false);
                                        }
                                    }}
                                />
                                <p className="text-gray-400 text-xs">Ctrl + Enter to submit</p>
                            </div>
                            <PrimaryButton onClick={onSubmit} disabled={!body || !date} isLoading={isLoading}>
                                Add note
                            </PrimaryButton>
                        </div>
                    )}
                    {notesData && notesData.data ? (
                        notesData.data.length > 0 ? (
                            notesData.data.map((note) => (
                                <div className="mb-16" key={note._id}>
                                    <ContextMenuTrigger id={note._id}>
                                        <H2 className="text-center mb-4">{note.date}</H2>
                                    </ContextMenuTrigger>
                                    {isOwner && (
                                        <ContextMenu
                                            id={note._id}
                                            className="bg-white rounded-md shadow-lg z-10 cursor-pointer"
                                        >
                                            <MenuItem
                                                onClick={() => {
                                                    onDelete(note._id);
                                                }}
                                                className="flex hover:bg-gray-50 p-4"
                                            >
                                                <FiTrash />
                                                <span className="ml-2 -mt-0.5">Delete</span>
                                            </MenuItem>
                                        </ContextMenu>
                                    )}
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
                                    $and: [
                                        { $expr: { $eq: ["$_id", "$$userId"] } },
                                        { $expr: { $eq: ["$username", username] } },
                                    ],
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

        if (!session)
            return {
                props: {
                    thisSeries: cleanForJSON(thisSeries),
                    canEdit: thisSeries.privacy === "publicCanEdit",
                    isOwner: false,
                },
            };
        const sessionUser = await UserModel.findOne({ email: session.user.email });
        if (!sessionUser)
            return {
                props: {
                    thisSeries: cleanForJSON(thisSeries),
                    canEdit: thisSeries.privacy === "publicCanEdit",
                    isOwner: false,
                },
            };

        const isOwner = sessionUser._id.toString() === thisSeries.userId.toString();
        const canEdit = thisSeries.privacy === "publicCanEdit" || isOwner;
        return { props: { thisSeries: cleanForJSON(thisSeries), canEdit: canEdit, isOwner: isOwner } };
    } catch (e) {
        console.log(e);
        return { notFound: true };
    }
};
