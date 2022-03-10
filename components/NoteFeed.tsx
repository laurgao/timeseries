import axios from "axios";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import useSWR, { SWRResponse } from "swr";
import fetcher from "../utils/fetcher";
import useKey, { waitForEl } from "../utils/key";
import { DatedObj, NoteObj, SeriesObj, UserObj } from "../utils/types";
import AutoresizingTextarea from "./headless/AutoresizingTextarea";
import Input from "./headless/Input";
import Note from "./Note";
import NotionButton from "./style/NotionButton";
import PrimaryButton from "./style/PrimaryButton";

const NoteFeed = ({ thisSeries, isOwner }: { thisSeries: DatedObj<SeriesObj & { user: UserObj }>; isOwner: boolean }) => {
    const canCreateNewNote = thisSeries.privacy === "publicCanEdit" || isOwner;
    const [addNoteIsOpen, setAddNoteIsOpen] = useState<boolean>(false);
    const [editNoteIsOpen, setEditNoteIsOpen] = useState<boolean>(false);
    const [body, setBody] = useState<string>("");
    const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [iter, setIter] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [latestNotes, setLatestNotes] = useState<DatedObj<NoteObj>[]>();
    const { data: notesData, error: notesError }: SWRResponse<{ data: DatedObj<NoteObj>[] }, any> = useSWR(
        `/api/note?seriesId=${thisSeries._id}&iter=${iter}`,
        fetcher
    );

    // Store the latest notes array so that the notes stay rendered between refreshes
    useEffect(() => {
        if (notesData && notesData.data) setLatestNotes(notesData.data);
    }, [notesData])


    function handleNewNote() {
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
        if (!addNoteIsOpen && !editNoteIsOpen && canCreateNewNote) {
            e.preventDefault();
            setAddNoteIsOpen(true);
            waitForEl("new-note-body");
        }
    });

    useEffect(() => {
        window.onbeforeunload = (addNoteIsOpen && body) ? () => true : undefined;

        return () => {
            window.onbeforeunload = undefined;
        };
    }, [addNoteIsOpen, body]);

    return (
        <>
            {canCreateNewNote && !addNoteIsOpen && (
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
                        <AutoresizingTextarea
                            value={body}
                            setValue={setBody}
                            id="new-note-body"
                            placeholder="What were the most interesting events in today's news?"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    if (e.ctrlKey) handleNewNote();
                                } else if (e.key === "Escape") {
                                    setAddNoteIsOpen(false);
                                }
                            }}
                            rows={7}
                        />
                        <p className="text-gray-400 text-xs">Ctrl + Enter to submit</p>
                    </div>
                    <PrimaryButton onClick={handleNewNote} disabled={!body || !date} isLoading={isLoading}>
                        Add note
                    </PrimaryButton>
                </div>
            )}
            {latestNotes ? (
                latestNotes.length > 0 ? (
                    latestNotes.map((note) => <Note key={note._id} note={note} canModifyExisting={isOwner} setIter={setIter} toggleDisallowNShortcut={setEditNoteIsOpen} />)
                ) : (
                    <p>No notes... yet 😏</p>
                )
            ) : (
                <Skeleton count={2} />
            )}
        </>
    );
};

export default NoteFeed;
