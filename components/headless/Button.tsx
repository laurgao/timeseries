import Link from "next/link";

export type ButtonProps = (React.HTMLProps<HTMLButtonElement> | React.HTMLProps<HTMLAnchorElement>) 
& {isLoading?: boolean, childClassName?: string}

export default function Button(props: ButtonProps) {
    const classNames = (
        props.className 
        + " p-2 relative" 
        + (props.disabled ? " cursor-not-allowed opacity-50" : "") 
        + (props.isLoading ? " cursor-wait" : "")
    );
    const childClassNames = props.childClassName + (props.isLoading ? " invisible" : "")

    const newProps = {...props}
    delete newProps.isLoading
    delete newProps.children
    delete newProps.childClassName

    return props.href ? (
        <Link href={props.href}>
            {/* @ts-ignore */}
            <a {...newProps} className={classNames}>
                <div className={childClassNames}>{props.children}</div>
                {props.isLoading && <div className="up-spinner"/>}
            </a>
        </Link>
    ) : (
        // @ts-ignore
        <button {...newProps} className={classNames} disabled={props.disabled || props.isLoading}>
            <div className={childClassNames}>{props.children}</div>
            {props.isLoading && <div className="up-spinner"/>}
        </button>
    );
}