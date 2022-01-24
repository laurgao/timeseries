import Link from "next/link";
import { color } from "../../utils/utils";

// Props can be anything in React.HTMLProps<HTMLAnchorElement> except for className, which will be overwritten
const A = (props: React.HTMLProps<HTMLAnchorElement>) => (
    <Link href={props.href}>
        <a {...props} className={`underline hover:text-${color}-400 transition`} />
    </Link>
);
export default A;
