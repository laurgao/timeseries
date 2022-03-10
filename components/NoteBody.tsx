import { BadgeCheckIcon } from '@heroicons/react/outline';
import axios from "axios";
import Linkify from "linkify-react";
import { Dispatch, SetStateAction, useEffect, useReducer, useState } from 'react';
import { useInterval } from "../utils/hooks";
import { waitForEl } from "../utils/key";
import { DatedObj, NoteObj, NoteObjGraph } from "../utils/types";
import { color } from "../utils/utils";
import AutoresizingTextarea from "./headless/AutoresizingTextarea";


const NoteBody = ({ note, setIter, canEdit, toggleDisallowNShortcut }: { note: DatedObj<NoteObj> | DatedObj<NoteObjGraph>, canEdit?: boolean, setIter?: Dispatch<SetStateAction<number>>, toggleDisallowNShortcut?: Dispatch<SetStateAction<boolean>> }) => {
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


    function saveNote() {
        if (!state.isSaved) {
            if (body.length > 0) {
                axios.post(`/api/note`, { id: note._id, body: body }).then(() => {
                    dispatch({ type: 'setIsSaved' });
                    setIter(prevIter => prevIter + 1);
                });
            } else {
                axios.delete(`/api/note`, { data: { id: note._id } }).then(() => {
                    dispatch({ type: 'setIsSaved' });
                    setIter(prevIter => prevIter + 1);
                });
            }
        } else {
            // Refresh the note data from mongodb if we press esc when the note is already saved.
            setIter(prevIter => prevIter + 1);
        }
    }

    function onSetIsNotEdit() {
        // Always call this function when want to call `setIsEdit(false)`
        if (body.length === 0) {
            alert("Are you sure you want to delete this note?")
        }
        saveNote();
        setIsEdit(false);
        toggleDisallowNShortcut(false);
    }

    useInterval(saveNote, state.interval);

    // Create alert if exit tab when it's not saved.
    useEffect(() => {
        window.onbeforeunload = (!state.isSaved) ? () => true : undefined;

        return () => {
            window.onbeforeunload = undefined;
        };
    }, [state.isSaved]);

    return !isEdit ? (
        <div
            className={`overflow-hidden break-words ${canEdit && "cursor-pointer hover:bg-gray-50 p-4 rounded-md transition"}`}
            onClick={() => {
                if (canEdit) {
                    setIsEdit(true);
                    waitForEl(`${note._id}-note-body`);
                    toggleDisallowNShortcut(true);
                };
            }}
        >
            <Linkify tagName="pre" options={{ className: `text-${color}-500 underline` }}>
                {body}
            </Linkify>
        </div>
    ) : (
        /* <Input type="date" value={date} setValue={setDate} className="my-8" /> */
        <div>
            <AutoresizingTextarea
                onBlur={onSetIsNotEdit}
                type="textarea"
                value={body}
                onChange={(e) => {
                    setBody(e.target.innerText);
                    dispatch({ type: 'setIsNotSaved' });
                }}
                id={`${note._id}-note-body`}
                placeholder="What were the most interesting events in today's news?"
                onKeyDown={(e) => {
                    if (e.key === "Escape") onSetIsNotEdit();
                }}
            />
            <div className="text-gray-400 text-xs flex items-center">{body === note.body ? (
                <><span className="leading-none">All changes updated</span><BadgeCheckIcon className="w-4 h-4 ml-2" /></>
            ) : state.isSaved ? "Saved" : "Saving..."}</div>
        </div>
    )
}

export default NoteBody