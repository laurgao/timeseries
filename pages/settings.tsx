import { GetServerSideProps } from "next";
import { getSession } from "next-auth/client";
import { ssr404, ssrRedirect } from "next-response-helpers";
import { UserModel } from "../models/User";
import dbConnect from "../utils/dbConnect";
import {useState, useEffect} from "react";
import Container from "../components/headless/Container";
import PrimaryButton from "../components/headless/PrimaryButton";
import axios from "axios";
import {BsCheckCircle} from "react-icons/bs"
import Select from "../components/headless/Select";
import { DatedObj, UserObj } from "../utils/types";

const Settings = (props: {thisUser: DatedObj<UserObj>}) => {
    const [isSaved, setIsSaved] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [language, setLanguage] = useState<string>(props.thisUser.language);
    const [username, setUsername] = useState<string>("");
    const onSubmit = () => {
        axios.post("api/auth/account", {})
            .then(res => setIsSaved(true))
            .catch(e => {
                setError("An unknown error occured.")
                console.log(e)
            })
    }
    useEffect(() => {
        // remove saved checkmark every time user edits an input
        setIsSaved(false)
    }, [language, username])

    return (
        <>
            <Container>
                <Select
                    value={language}
                    default="Select language"
                    // @ts-ignore propertly value exists on e.target
                    onChange={(e) => setLanguage(e.target.value)}
                    // lol im defaulting writing dbs in french now?
                    options={[{value: "anglais", label: "English"}, {value: "français", label: "Français"}]}
                />
                <PrimaryButton onClick={onSubmit}>Save</PrimaryButton>
                {isSaved && <div className="flex items-center text-green-500 my-2"><BsCheckCircle/><p>Saved!</p></div>}
                {error && <div className="text-red-500 my-2"><p>{error}</p></div>}
            </Container>
        </>
    );
};

export default Settings;

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    if (!session) return ssr404

    try {
        await dbConnect();

        const thisUser = await UserModel.findOne({ email: session.user.email });
        if (!thisUser) return ssrRedirect("/auth/newaccount"); 
        //  do i want to suppport a person who's signed in but didnt make a new account on every page?
        // I guess i'll do it on settings because it is in the navbar... 

        return {props: {thisUser: thisUser}}

        return 
    } catch (e) {
        console.log(e);
        return ssr404;
    }
};