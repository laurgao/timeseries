import { GetServerSideProps } from "next";
import { getSession } from "next-auth/client";
import { UserModel } from "../models/User";
import dbConnect from "../utils/dbConnect";
import { format } from "date-fns";
import Button from "../components/headless/Button";
import H2 from "../components/headless/H2";
import SEO from "../components/SEO";
import Container from "../components/headless/Container";
import NotionButton from "../components/headless/NotionButton";
import {DatedObj, NoteObj, UserObj} from "../utils/types";
import axios from "axios";
import { useState } from "react";
import useSWR, { SWRResponse } from "swr";
import fetcher from "../utils/fetcher";
import H1 from "../components/headless/H1";
import Skeleton from "react-loading-skeleton";
import Input from "../components/headless/Input";
import cleanForJSON from "../utils/cleanForJSON";
import useKey, {waitForEl} from "../utils/key";

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
            setIter(iter+1);
            setDate(format(new Date(), "yyyy-MM-dd"));
            setBody("");
            setAddNoteIsOpen(false);
        }).catch(e => console.log(e)).finally(() => setIsLoading(false));
    }

    useKey("KeyN", (e) => {
        if (!addNoteIsOpen) {
            e.preventDefault();
            setAddNoteIsOpen(true);
            waitForEl("new-note-body");
        }
    })
    useKey("Enter", (e) => {
        if (addNoteIsOpen) {
            e.preventDefault();
            onSubmit();
        }
    })
    useKey("Escape", (e) => {
        if (addNoteIsOpen) {
            e.preventDefault();
            setAddNoteIsOpen(false);
        }
    })

    return (
        <>
        <SEO />
        <Container width="xl">
            <>
            <H1 className="mb-8 text-center">Timeseries</H1>
            {props.user && props.user.email === "gaolauro@gmail.com" && !addNoteIsOpen &&
                <div className="my-4"><NotionButton onClick={() => setAddNoteIsOpen(true)}>New note (n)</NotionButton></div>
            }
            {addNoteIsOpen && 
                <div className="mb-16">
                    <Input type="date" value={date} setValue={setDate}/>
                    <Input 
                        type="textarea" value={body} setValue={setBody} id="new-note-body"
                        placeholder="What were the most interesting events in today's news?"
                    />
                    <Button onClick={onSubmit} disabled={!body || !date} isLoading={isLoading}>Add note</Button>
                </div>
            }
            {(notesData && notesData.data) ? notesData.data.map(note => 
                <div className="mb-16">
                    <H2 className="text-center mb-4">{note.date}</H2>
                    <p>{note.body}</p>
                </div>    
            ) : <Skeleton count={2} />}
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