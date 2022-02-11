import axios from "axios";
import React, { Dispatch, SetStateAction } from "react";
import { ContextMenu, ContextMenuTrigger, MenuItem } from "react-contextmenu";
import { FiTrash } from "react-icons/fi";
import { DatedObj, NoteObj, NoteObjGraph } from "../utils/types";
import H2 from "./headless/H2";
import NoteBody from "./NoteBody";
import A from "./style/A";

const Note = ({
    note,
    canDelete,
    setIter,
    includeSubtitle,
}: {
    note: DatedObj<NoteObj> | DatedObj<NoteObjGraph>;
    canDelete?: boolean;
    setIter?: Dispatch<SetStateAction<number>>;
    includeSubtitle?: boolean;
}) => {
    function onDelete(noteId: string) {
        // setIsLoading(true);
        axios
            .delete(`/api/note`, { data: { id: noteId } })
            .then((res) => {
                console.log(res.data.message);
                setIter((prevIter) => prevIter + 1);
            })
            .catch((e) => console.log(e));
        // .finally(() => setIsLoading(false));
    }

    return (
        <div className="mb-16">
            <ContextMenuTrigger id={note._id}>
                <div className="text-center mb-4">
                    <H2>{note.date}</H2>
                    {includeSubtitle && (
                        <p className="text-sm text-gray-400">
                            Series: {/* @ts-ignore only will includesubtitle if type is noteobjgraph */}
                            <A href={`/${note.series.user.username}/${note.series.title.toLowerCase()}`}>
                                {/* @ts-ignore only will includesubtitle if type is noteobjgraph */}
                                {note.series.title}
                            </A>
                        </p>
                    )}
                </div>
            </ContextMenuTrigger>
            {canDelete && (
                <ContextMenu id={note._id} className="bg-white rounded-md shadow-lg z-10 cursor-pointer">
                    <MenuItem
                        onClick={() => {
                            onDelete(note._id);
                        }}
                        className="flex hover:bg-gray-50 p-4 items-center"
                    >
                        <FiTrash />
                        <span className="ml-2">Delete</span>
                    </MenuItem>
                </ContextMenu>
            )}
            <NoteBody note={note} setIter={setIter} canEdit={canDelete} />
        </div>
    );
};

export default Note;
