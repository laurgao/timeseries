import axios from "axios";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import useSWR, { SWRResponse } from "swr";
import fetcher from "../utils/fetcher";
import useKey, { waitForEl } from "../utils/key";
import { DatedObj, NoteObj, SeriesObj, UserObj } from "../utils/types";
import Input from "./headless/Input";
import Note from "./Note";
import NotionButton from "./style/NotionButton";
import PrimaryButton from "./style/PrimaryButton";

const NoteFeed = ({ thisSeries, isOwner }: { thisSeries: DatedObj<SeriesObj & { user: UserObj }>; isOwner: boolean }) => {
    const canEdit = thisSeries.privacy === "publicCanEdit" || isOwner;
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

    useKey("KeyN", (e) => {
        if (!addNoteIsOpen && canEdit) {
            e.preventDefault();
            setAddNoteIsOpen(true);
            waitForEl("new-note-body");
        }
    });

    // useEffect(() => {
    //     const cleanup = (e) => {
    //         e.preventDefault();
    //         return "Are you sure you want to exit? You have unsaved changes.";
    //     }

    //     window.addEventListener("beforeunload", cleanup);

    //     return () => window.removeEventListener("beforeunload", cleanup);
    // }, [addNoteIsOpen])
    useEffect(() => {
        window.onbeforeunload = () => true;

        return () => {
            window.onbeforeunload = undefined;
        };
    }, []);

    return (
        <>
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
                    notesData.data.map((note) => <Note key={note._id} note={note} canDelete={isOwner} setIter={setIter} />)
                ) : (
                    <p>No notes.</p>
                )
            ) : (
                <Skeleton count={2} />
            )}
        </>
    );
};

export default NoteFeed;
