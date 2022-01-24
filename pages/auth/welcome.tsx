import { GetServerSideProps } from "next";
import { getSession, signIn } from "next-auth/client";
import { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import Container from "../../components/headless/Container";
import H1 from "../../components/headless/H1";
import { navbarHeight } from "../../components/Navbar";
import SEO from "../../components/SEO";
import PrimaryButton from "../../components/style/PrimaryButton";
import { UserModel } from "../../models/User";
import dbConnect from "../../utils/dbConnect";

export default function Welcome({}: {}) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    return (
        <>
            <SEO title="Sign in" />
            <Container className="text-center flex w-screen items-center justify-center" style={{ height: `calc(100vh - ${navbarHeight * 2}px)` }}>
                <div>
                    <H1 className="mb-4">Welcome to Timeseries</H1>
                    <p className="mb-8">Click the button below to sign in to or sign up for Timeseries with your Google account.</p>
                    {/* Sign in button */}
                    <PrimaryButton
                        onClick={() => {
                            setIsLoading(true);
                            signIn("google").then((res) => setIsLoading(false));
                        }}
                        isLoading={isLoading}
                    >
                        <div className="flex items-center">
                            <FaGoogle />
                            <span className="ml-2">Sign in</span>
                        </div>
                    </PrimaryButton>
                </div>
            </Container>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    if (!session) return { props: {} };

    try {
        await dbConnect();
        const thisUser = await UserModel.findOne({ email: session.user.email });
        return { redirect: { permanent: false, destination: thisUser ? "/profile" : "/auth/newaccount" } };
    } catch (e) {
        console.log(e);
        return { notFound: true };
    }
};
