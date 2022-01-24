import { signOut, useSession } from "next-auth/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import Button from "./headless/Button";
import Container from "./headless/Container";

export const navbarHeight = 40 + 16 + 1 // content + padding + border 

export default function Navbar() {
    const [session, loading] = useSession();
    const router = useRouter();

    return (
        <div className="w-full sticky top-0 z-40">
            <Container className="flex items-center py-2 bg-gray-100 border-b border-gray-400" width="full">
                <Link href="/"><a>Timeseries</a></Link>
                <div className="ml-auto flex items-center" style={{ gridGap: 16 }}>
                    {!loading ? session ? (
                        <>
                            <Button onClick={() => signOut()} className="text-sm">Sign out</Button>
                            <Button href="/profile" className="text-sm">Profile</Button>
                            <Button href="/settings" className="text-sm">Settings</Button>
                            <Image
                                src={session.user.image}
                                alt={`Profile picture of ${session.user.name}`}
                                width={32}
                                height={32}
                                className="rounded-full"
                            />
                        </>
                    ) : (
                        <Button onClick={() => router.push("/auth/welcome")}>Sign in</Button>
                    ) : <p>Loading...</p>}
                </div>
            </Container>
        </div>
    );
}
