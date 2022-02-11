import axios from "axios";
import Linkify from "linkify-react";
import { Dispatch, SetStateAction, useState } from 'react';
import { useInterval } from "../utils/hooks";
import { DatedObj, NoteObj, NoteObjGraph } from "../utils/types";
import { color } from "../utils/utils";
import Input from "./headless/Input";

const NoteBody = ({ note, setIter }: { note: DatedObj<NoteObj> | DatedObj<NoteObjGraph>, setIter?: Dispatch<SetStateAction<number>> }) => {
    const [isEdit, setIsEdit] = useState(false);
    const [body, setBody] = useState<string>(note.body);
    // const [date, setDate] = useState<string>(format(new Date(note.date), "yyyy-MM-dd"));
    const [isSaved, setIsSaved] = useState<boolean>(true);
    const [interval, setInterval] = useState<number>(null);

    function saveNote() {
        console.log("interval")
        if (!isSaved && body.length > 0) {
            axios.post(`/api/note`, { id: note._id, body: body }).then(() => {
                setInterval(null);
                setIsSaved(true);
            });
        }
    }

    function onSetIsNotEdit() {
        saveNote();
        if (body.length === 0) {
            alert("Are you sure you want to delete this note?")
        }
        setIsEdit(false);
        setInterval(null);
        setIter(prevIter => prevIter + 1);
    }

    useInterval(saveNote, interval);

    return !isEdit ? (
        <div
            className="overflow-hidden break-words cursor-pointer hover:bg-gray-50 p-2 rounded-md transition"
            onClick={() => {
                setIsEdit(true);
            }}
        >
            <Linkify tagName="pre" options={{ className: `text-${color}-500 underline` }}>
                {note.body}
            </Linkify>
        </div>
    ) : (
        <div className="mb-16">
            {/* <Input type="date" value={date} setValue={setDate} className="my-8" /> */}
            <div className="my-8">
                <Input
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
                    onKeyDown={(e) => {
                        if (e.key === "Escape") onSetIsNotEdit();
                    }}
                />
                <p className="text-gray-400 text-xs">{isSaved ? "Saved" : "Saving..."}</p>
            </div>
        </div>
    )
}

export default NoteBody