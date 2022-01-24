import axios from "axios";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/client";
import React, { useState } from "react";
import { useToasts } from 'react-toast-notifications';
import Button from "../../components/headless/Button";
import Container from "../../components/headless/Container";
import H1 from "../../components/headless/H1";
import H2 from "../../components/headless/H2";
import Input from "../../components/headless/Input";
import Select from "../../components/headless/Select";
import NotionButton from "../../components/style/NotionButton";
import PrimaryButton from "../../components/style/PrimaryButton";
import { UserModel } from "../../models/User";
import cleanForJSON from "../../utils/cleanForJSON";
import dbConnect from "../../utils/dbConnect";
import showToast from "../../utils/showToast";
import { DatedObj, PrivacyTypes, SeriesObj, UserObj } from "../../utils/types";

const UserProfilePage = ({ pageUser, isOwner }: { pageUser: DatedObj<UserObj> & { seriesArr: DatedObj<SeriesObj>[] }; isOwner: boolean }) => {
    const [newSeriesTitle, setNewSeriesTitle] = useState<string>(null);
    const [newSeriesPrivacy, setNewSeriesPrivacy] = useState<PrivacyTypes | "">(""); // select's value should not be null
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const disabled = !newSeriesTitle || !newSeriesPrivacy || newSeriesTitle !== encodeURIComponent(newSeriesTitle);

    const reset = () => {
        setNewSeriesTitle(null);
        setNewSeriesPrivacy("");
        setError("");
    };

    const { addToast } = useToasts();
    function onSubmit() {
        if (disabled) return;
        setIsLoading(true);
        axios
            .post("/api/series", { title: newSeriesTitle, user: pageUser._id, privacy: newSeriesPrivacy })
            .then((res) => {
                if (res.data.error) setError(res.data.error);
                else {
                    reset();
                    showToast(true, "Series created! Refresh this page to see your new series.", addToast);
                }
            })
            .catch((e) => console.log(e))
            .finally(() => setIsLoading(false));
    }

    return (
        <Container>
            <div className="mb-8 text-center">
                <H1>{pageUser.name}</H1>
                <p className="text-gray-400">@{pageUser.username}</p>
            </div>
            {/* Maybe this notion button w 2 states a component */}
            {isOwner && (
                <div className="mb-8">
                    {newSeriesTitle === null ? (
                        <NotionButton onClick={() => setNewSeriesTitle("")}>New series</NotionButton>
                    ) : (
                        <>
                            <Input
                                value={newSeriesTitle}
                                onChange={(e) => {
                                    setNewSeriesTitle(e.target.value);
                                    if (e.target.value !== encodeURIComponent(e.target.value)) {
                                        setError("Title cannot contain spaces or special characters.");
                                    } else setError(null);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        if (e.ctrlKey) onSubmit();
                                    } else if (e.key === "Escape") reset();
                                }}
                                className="mb-4"
                                childClassName="px-2" // to line up with select
                                placeholder="Title"
                                autoFocus
                            />
                            <Select
                                className="block"
                                value={newSeriesPrivacy}
                                default="Select privacy"
                                // @ts-ignore properly value exists on e.target
                                onChange={(e) => setNewSeriesPrivacy(e.target.value)}
                                options={[
                                    { value: "private", label: "Private" },
                                    { value: "publicVisible", label: "Public (visible)" },
                                    { value: "publicCanEdit", label: "Public (can edit)" },
                                ]}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        if (e.ctrlKey) onSubmit();
                                    } else if (e.key === "Escape") {
                                        setNewSeriesTitle(null);
                                        setNewSeriesPrivacy("");
                                    }
                                }}
                            />
                            {!disabled && <p className="text-gray-400 text-xs px-2 mt-2">Ctrl + Enter to submit</p>}
                            {error && <p className="text-red-500 font-bold mt-4 px-2">{error}</p>}
                            <PrimaryButton className="mt-8 mb-16" onClick={onSubmit} disabled={disabled} isLoading={isLoading}>
                                Create new series
                            </PrimaryButton>
                        </>
                    )}
                </div>
            )}
            <p className="font-bold text-gray-700 text-sm">All of {pageUser.name}'s Timeseries':</p>
            {pageUser.seriesArr.length > 0 ? (
                pageUser.seriesArr.map((series) => (
                    <Button key={series._id} href={`/${pageUser.username}/${series.title.toLowerCase()}`}>
                        <H2>{series.title}</H2>
                    </Button>
                    // latest notes maybe?
                ))
            ) : (
                <p>No timeseries had been created... yet 😏</p>
            )}
        </Container>
    );
};

export default UserProfilePage;

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);
    // if (!session) return {props: {user: null}}

    try {
        await dbConnect();
        // const pageUser = await UserModel.findOne({username: context.params.username});
        const pageUser = (
            await UserModel.aggregate([
                { $match: { username: context.params.username } },
                {
                    $lookup: {
                        from: "series",
                        localField: "_id",
                        foreignField: "userId",
                        as: "seriesArr",
                    },
                },
            ])
        )[0];
        if (!pageUser) return { notFound: true };
        return {
            props: {
                pageUser: cleanForJSON(pageUser),
                isOwner: session && session.user.email === pageUser.email.toString(),
            },
        };
    } catch (e) {
        console.log(e);
        return { notFound: true };
    }
};
