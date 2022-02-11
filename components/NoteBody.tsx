import axios from "axios";
import Linkify from "linkify-react";
import { Dispatch, SetStateAction, useState } from 'react';
import { useInterval } from "../utils/hooks";
import { DatedObj, NoteObj, NoteObjGraph } from "../utils/types";
import { color } from "../utils/utils";
import Input from "./headless/Input";

const NoteBody = ({ note, setIter, canEdit }: { note: DatedObj<NoteObj> | DatedObj<NoteObjGraph>, canEdit?: boolean, setIter?: Dispatch<SetStateAction<number>> }) => {
    const [isEdit, setIsEdit] = useState(false);
    const [body, setBody] = useState<string>(note.body);
    // const [date, setDate] = useState<string>(format(new Date(note.date), "yyyy-MM-dd"));
    const [isSaved, setIsSaved] = useState<boolean>(true);
    const [interval, setInterval] = useState<number>(null);

    function saveNote(incrementIter?: boolean) {
        if (!isSaved) {
            if (body.length > 0) {
                axios.post(`/api/note`, { id: note._id, body: body }).then(() => {
                    setInterval(null);
                    setIsSaved(true);
                    if (incrementIter) setIter(prevIter => prevIter + 1);
                });
            } else {
                axios.delete(`/api/note`, { data: { id: note._id } }).then(() => {
                    setInterval(null);
                    setIsSaved(true);
                    if (incrementIter) setIter(prevIter => prevIter + 1);
                });
            }
        }
    }

    function onSetIsNotEdit() {
        if (body.length === 0) {
            alert("Are you sure you want to delete this note?")
        }
        saveNote(true);
        setIsEdit(false);
        setInterval(null);

    }

    useInterval(saveNote, interval);

    return !isEdit ? (
        <div
            className={`overflow-hidden break-words ${canEdit && "cursor-pointer hover:bg-gray-50 p-2 rounded-md transition"}`}
            onClick={() => {
                if (canEdit) setIsEdit(true);
            }}
        >
            <Linkify tagName="pre" options={{ className: `text-${color}-500 underline` }}>
                {note.body}
            </Linkify>
        </div>
    ) : (
        /* <Input type="date" value={date} setValue={setDate} className="my-8" /> */
        <div className="my-8">
            <Input
                onBlur={onSetIsNotEdit}
                type="textarea"
                value={body}
                onChange={(e) => {
                    setBody(e.target.value);
                    setIsSaved(false);
                    setInterval(1000);
                }}
                id="new-note-body"
                placeholder="What were the most interesting events in today's news?"
                autoFocus
                onFocus={function (e) {
                    // focus cursor to the end of text
                    var val = e.target.value;
                    e.target.value = '';
                    e.target.value = val;
                }}
                onKeyDown={(e) => {
                    if (e.key === "Escape") onSetIsNotEdit();
                }}
            />
            <p className="text-gray-400 text-xs">{isSaved ? "Saved" : "Saving..."}</p>
        </div>
    )
}

export default NoteBody