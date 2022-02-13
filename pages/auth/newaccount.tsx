import axios from "axios";
import { GetServerSideProps } from "next";
import { getSession, useSession } from "next-auth/client";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import Container from "../../components/headless/Container";
import H1 from "../../components/headless/H1";
import H3 from "../../components/headless/H3";
import Input from "../../components/headless/Input";
import { navbarHeight } from "../../components/Navbar";
import SEO from "../../components/SEO";
import PrimaryButton from "../../components/style/PrimaryButton";
import { UserModel } from "../../models/User";
import dbConnect from "../../utils/dbConnect";

export default function SignIn({ }: {}) {
    const router = useRouter();
    const [session, loading] = useSession();
    const [username, setUsername] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>(null);

    function onSubmit() {
        setIsLoading(true);

        axios
            .post("/api/auth/account", {
                username: username,
            })
            .then((res) => {
                if (res.data.error) {
                    setError(res.data.error);
                    setIsLoading(false);
                } else {
                    console.log("redirecting...");
                    router.push("/profile");
                }
            })
            .catch((e) => {
                setIsLoading(false);
                setError("An unknown error occurred.");
                console.log(e);
            });
    }

    return (
        <>
            <SEO title="Create new account" />
            <Container className="text-center flex w-screen items-center justify-center" style={{ height: `calc(100vh - ${navbarHeight * 2}px)` }}>
                <div>
                    <H1 className="mb-8">Welcome to Timeseries!</H1>
                    {loading ? (
                        <Skeleton count={2} />
                    ) : (
                        <div className="flex items-center text-left">
                            <Image src={session.user.image} alt={`Profile picture of ${session.user.name}`} className="rounded-full mr-4" height={48} width={48} />
                            <div>
                                <p>{session.user.name}</p>
                                <p>{session.user.email}</p>
                            </div>
                        </div>
                    )}
                    <H3 className="mt-8">Choose a username</H3>
                    <div className="flex items-center">
                        <p className="opacity-50">timeseries.vercel.com/</p>
                        <Input
                            type="text"
                            value={username}
                            onChange={(e) => {
                                const target = e.target as HTMLInputElement
                                setUsername(target.value);
                                if (target.value !== encodeURIComponent(target.value)) {
                                    setError("URLs cannot contain spaces or special characters.");
                                }
                                setError(null);
                            }}
                            autoFocus // waow this works when u are redirected here from /profile!
                        />
                    </div>
                    {error && <p className="text-red-500 font-bold">{error}</p>}
                    <PrimaryButton
                        isLoading={isLoading}
                        onClick={onSubmit}
                        disabled={loading || username !== encodeURIComponent(username) || username.length === 0}
                        className="mt-8"
                    >
                        Let's get started!
                    </PrimaryButton>
                </div>
            </Container>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    if (!session) return { redirect: { permanent: false, destination: "/auth/welcome" } };

    try {
        await dbConnect();
        const thisUser = await UserModel.findOne({ email: session.user.email });
        return thisUser ? { redirect: { permanent: false, destination: "/profile" } } : { props: {} };
    } catch (e) {
        console.log(e);
        return { notFound: true };
    }
};
