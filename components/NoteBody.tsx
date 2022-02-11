import axios from "axios";
import Linkify from "linkify-react";
import { Dispatch, SetStateAction, useReducer, useState } from 'react';
import { useInterval } from "../utils/hooks";
import { DatedObj, NoteObj, NoteObjGraph } from "../utils/types";
import { color } from "../utils/utils";
import Input from "./headless/Input";

const NoteBody = ({ note, setIter, canEdit }: { note: DatedObj<NoteObj> | DatedObj<NoteObjGraph>, canEdit?: boolean, setIter?: Dispatch<SetStateAction<number>> }) => {
    const [isEdit, setIsEdit] = useState(false);
    const [body, setBody] = useState<string>(note.body);
    // const [date, setDate] = useState<string>(format(new Date(note.date), "yyyy-MM-dd"));

    function reducer(state, action) {
        switch (action.type) {
            case 'setIsSaved':
                return { isSaved: true, interval: null };
            case 'setIsNotSaved':
                return { isSaved: false, interval: 1000 };
            default:
                throw new Error();
        }
    }
    const [state, dispatch] = useReducer(reducer, { isSaved: true, interval: null });


    function saveNote(incrementIter?: boolean) {
        if (!state.isSaved) {
            if (body.length > 0) {
                axios.post(`/api/note`, { id: note._id, body: body }).then(() => {
                    dispatch({ type: 'setIsSaved' });
                    if (incrementIter) setIter(prevIter => prevIter + 1);
                });
            } else {
                axios.delete(`/api/note`, { data: { id: note._id } }).then(() => {
                    dispatch({ type: 'setIsSaved' });
                    if (incrementIter) setIter(prevIter => prevIter + 1);
                });
            }
        } else {
            // Refresh the note data from mongodb if we press esc when the note is already saved.
            if (incrementIter) setIter(prevIter => prevIter + 1);
        }
    }

    function onSetIsNotEdit() {
        // Always call this function when want to call `setIsEdit(false)`
        if (body.length === 0) {
            alert("Are you sure you want to delete this note?")
        }
        saveNote(true);
        setIsEdit(false);
    }

    useInterval(saveNote, state.interval);

    return !isEdit ? (
        <div
            className={`overflow-hidden break-words ${canEdit && "cursor-pointer hover:bg-gray-50 p-4 rounded-md transition"}`}
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
        <div>
            <Input
                onBlur={onSetIsNotEdit}
                type="textarea"
                value={body}
                onChange={(e) => {
                    setBody(e.target.value);
                    dispatch({ type: 'setIsNotSaved' });
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
            <p className="text-gray-400 text-xs">{state.isSaved ? "Saved" : "Saving..."}</p>
        </div>
    )
}

export default NoteBody