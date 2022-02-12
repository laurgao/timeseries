import { signOut, useSession } from "next-auth/client";
import Image from "next/image";
import Link from "next/link";
import Button from "./headless/Button";
import Container from "./headless/Container";

export const navbarHeight = 40 + 16 + 1 // content + padding + border 

export default function Navbar() {
    const [session, loading] = useSession();

    return (
        <nav className="w-full sticky top-0 z-40">
            <Container className="flex items-center py-2 bg-stone-100 border-b border-stone-400" width="full">
                <Link href={session ? "/profile" : "/auth/welcome"}><a>Timeseries</a></Link>
                <div className="ml-auto flex items-center gap-4">
                    {!loading ? session && (
                        <>
                            <Button onClick={() => signOut()} className="text-sm">Sign out</Button>
                            <Image
                                src={session.user.image}
                                alt={`Profile picture of ${session.user.name}`}
                                width={32}
                                height={32}
                                className="rounded-full"
                            />
                        </>
                    ) : <p>Loading...</p>}
                </div>
            </Container>
        </nav>
    );
}
