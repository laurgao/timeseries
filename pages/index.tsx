import axios from "axios";
import { format } from "date-fns";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/client";
import { useState } from "react";
import { ContextMenu, ContextMenuTrigger, MenuItem } from "react-contextmenu";
import { FiTrash } from "react-icons/fi";
import Skeleton from "react-loading-skeleton";
import useSWR, { SWRResponse } from "swr";
import Container from "../components/headless/Container";
import H1 from "../components/headless/H1";
import H2 from "../components/headless/H2";
import Input from "../components/headless/Input";
import NotionButton from "../components/headless/NotionButton";
import PrimaryButton from "../components/headless/PrimaryButton";
import SEO from "../components/SEO";
import { UserModel } from "../models/User";
import cleanForJSON from "../utils/cleanForJSON";
import dbConnect from "../utils/dbConnect";
import fetcher from "../utils/fetcher";
import useKey, { waitForEl } from "../utils/key";
import { DatedObj, NoteObj, UserObj } from "../utils/types";

export default function Home(props: {user: DatedObj<UserObj>}) {
    const [addNoteIsOpen, setAddNoteIsOpen] = useState<boolean>(false);
    const [body, setBody] = useState<string>("");
    const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [iter, setIter] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const {data: notesData, error: notesError}: SWRResponse<{data: DatedObj<NoteObj>[]}, any> = useSWR(`/api/note?user=6155bf008b03df2a80327d63&iter=${iter}`, fetcher);

    function onSubmit() {
        setIsLoading(true);
        axios.post("/api/note", {
            date: date,
            body: body,
        }).then((res) => {
            console.log(res.data.message);
            setIter(iter+1);
            setDate(format(new Date(), "yyyy-MM-dd"));
            setBody("");
            setAddNoteIsOpen(false);
        }).catch(e => console.log(e)).finally(() => setIsLoading(false));
    }

    function onDelete(noteId: string) {
        setIsLoading(true)
        axios.delete(`/api/note`, {data: {id: noteId,}}).then(res => {
            console.log(res.data.message);
            setIter(iter+1);
        }).catch(e => console.log(e)).finally(() => setIsLoading(false));
    }

    useKey("KeyN", (e) => {
        if (!addNoteIsOpen) {
            e.preventDefault();
            setAddNoteIsOpen(true);
            waitForEl("new-note-body");
        }
    })

    return (
        <>
        <SEO />
        <Container width="xl">
            <>
            <H1 className="mb-8 text-center">Timeseries</H1>
            {props.user && props.user.email === "gaolauro@gmail.com" && !addNoteIsOpen &&
                <div className="my-4"><NotionButton onClick={() => {
                    setAddNoteIsOpen(true);
                    waitForEl("new-note-body");
                }}>New note (n)</NotionButton></div>
            }
            {addNoteIsOpen && 
                <div className="mb-16">
                    <Input type="date" value={date} setValue={setDate} className="my-8"/>
                    <div className="my-8">
                        <Input 
                            type="textarea" value={body} setValue={setBody} id="new-note-body"
                            placeholder="What were the most interesting events in today's news?"
                            onKeyDown={e => {
                                if (e.key === "Enter") {
                                    if (e.ctrlKey) onSubmit();
                                } else if (e.key === "Escape") {
                                    setAddNoteIsOpen(false);
                                }
                            }}
                        />
                        <p className="text-gray-400 text-sm">Ctrl+Enter to add note</p>
                    </div>
                    <PrimaryButton onClick={onSubmit} disabled={!body || !date} isLoading={isLoading}>Add note</PrimaryButton>
                </div>
            }
            {(notesData && notesData.data) ? notesData.data.length > 0 ? notesData.data.map(note => 
                <div className="mb-16">
                    <ContextMenuTrigger id={note._id}>
                        <H2 className="text-center mb-4">{note.date}</H2>
                    </ContextMenuTrigger>
                   {props.user && props.user.email === "gaolauro@gmail.com" && <ContextMenu id={note._id} className="bg-white rounded-md shadow-lg z-10 cursor-pointer">
                        <MenuItem onClick={() => {onDelete(note._id)}} className="flex hover:bg-gray-50 p-4">
                            <FiTrash /><span className="ml-2 -mt-0.5">Delete</span>
                        </MenuItem>
                    </ContextMenu>}
                    <pre>{note.body}</pre>
                </div>    
            ) : <p>No notes.</p> : <Skeleton count={2} />}
            </>
        </Container>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);
    if (!session) return {props: {user: null}}

    try {
        await dbConnect();
        const thisUser = await UserModel.findOne({email: session.user.email});
        return {props: {user: cleanForJSON(thisUser)}};
    } catch (e) {
        console.log(e);
        return {notFound: true};
    }
  };