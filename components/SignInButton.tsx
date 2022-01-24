import { signIn } from "next-auth/client";
import { FaGoogle } from "react-icons/fa";
import PrimaryButton from "./style/PrimaryButton";

export default function SignInButton(props: { isLoading?: boolean; className?: string }) {
    return (
        <PrimaryButton onClick={() => signIn("google")} {...props}>
            <div className="flex items-center">
                <FaGoogle />
                <span className="ml-2">Sign in</span>
            </div>
        </PrimaryButton>
    );
}
