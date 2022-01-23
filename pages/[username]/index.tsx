import axios from "axios";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/client";
import React, { useState } from "react";
import Button from "../../components/headless/Button";
import Container from "../../components/headless/Container";
import H1 from "../../components/headless/H1";
import H2 from "../../components/headless/H2";
import Input from "../../components/headless/Input";
import NotionButton from "../../components/headless/NotionButton";
import PrimaryButton from "../../components/headless/PrimaryButton";
import Select from "../../components/headless/Select";
import { UserModel } from "../../models/User";
import cleanForJSON from "../../utils/cleanForJSON";
import dbConnect from "../../utils/dbConnect";
import { DatedObj, PrivacyTypes, SeriesObj, UserObj } from "../../utils/types";

const UserProfilePage = ({
    pageUser,
    isOwner,
}: {
    pageUser: DatedObj<UserObj> & { seriesArr: DatedObj<SeriesObj>[] };
    isOwner: boolean;
}) => {
    const [newSeriesTitle, setNewSeriesTitle] = useState<string>(null);
    const [newSeriesPrivacy, setNewSeriesPrivacy] = useState<PrivacyTypes | "">(""); // select's value should not be null
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const disabled = !newSeriesTitle || !newSeriesPrivacy;

    function onSubmit() {
        if (disabled) return;
        setIsLoading(true);
        axios
            .post("/api/series", { title: newSeriesTitle, user: pageUser._id, privacy: newSeriesPrivacy })
            .then((res) => {
                setNewSeriesTitle(null);
                setNewSeriesPrivacy("");
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
                                setValue={setNewSeriesTitle}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        if (e.ctrlKey) onSubmit()
                                    }
                                    else if (e.key === "Escape") {
                                        setNewSeriesTitle(null);
                                        setNewSeriesPrivacy("");
                                    }
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
                                    }
                                    else if (e.key === "Escape") {
                                        setNewSeriesTitle(null);
                                        setNewSeriesPrivacy("");
                                    }
                                }}
                            />
                            {!disabled && <p className="text-gray-400 text-xs px-2 mt-2">Ctrl + Enter to submit</p>}
                            <PrimaryButton className="mt-8 mb-16" onClick={onSubmit} disabled={disabled} isLoading={isLoading}>
                                Create new series
                            </PrimaryButton>
                        </>
                    )}
                </div>
            )}
            <p className="font-bold text-gray-700 text-sm">All of {pageUser.name}'s Timeseries':</p>
            {pageUser.seriesArr ? (
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
