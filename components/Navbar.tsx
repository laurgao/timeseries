import { signOut, useSession } from "next-auth/client";
import Link from "next/link";
import { useRouter } from "next/router";
import Button from "./headless/Button";
import Container from "./headless/Container";
import Image from "next/image"
import useSWR from "swr";
import fetcher from "../utils/fetcher";

export default function Navbar() {
    const [session, loading] = useSession();
    const router = useRouter();

    const {data} = useSWR("/api/user", fetcher);

    return (
        <div className="w-full sticky top-0">
            <Container className="flex items-center py-2 bg-gray-100 border-b border-gray-400" width="full">
                <Link href="/"><a>Timeseries</a></Link>
                <div className="ml-auto flex items-center" style={{gridGap: 16}}>
                    {!loading ? session ? (
                        <>
                        <Button onClick={() => signOut()} className="text-sm">Sign out</Button>
                        {(data && data.data) && <Button href={`/${data.data.username}`} className="text-sm">Profile</Button>}
                        <Image
                            src={session.user.image}
                            alt={`Profile picture of ${session.user.name}`}
                            width={32}
                            height={32}
                            className="rounded-full"
                        />
                        </>
                    ) : (
                        <Button onClick={() => router.push("/")}>Sign in</Button>
                    ) : <p>Loading...</p>}
                </div>
            </Container>
        </div>
    );
}