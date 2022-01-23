import { Dispatch, SetStateAction } from "react";
import H3 from "./H3";

type InputProps = (React.HTMLProps<HTMLInputElement> | React.HTMLProps<HTMLTextAreaElement>) & {
    setValue?: Dispatch<SetStateAction<string>>;
    type?: "text" | "textarea" | "date";
    name?: string;
    childClassName?: string;
};

const Input = (props: InputProps) => {
    let newProps = { ...props };
    if (newProps.setValue) newProps.onChange = (e) => props.setValue(e.target.value);
    newProps.className = props.childClassName + 
        (props.type === "textarea" ? " border rounded-md w-full my-2 p-4 text-gray-500" : " border-b w-full my-2 py-2");
    delete newProps.childClassName;
    delete newProps.name;
    delete newProps.type;
    delete newProps.setValue;
    return (
        <div className={props.className}>
            {props.name && <H3>{props.name}</H3>}
            {props.type !== "textarea" ? (
                // @ts-ignore
                <input {...newProps} type={props.type} />
            ) : (
                // @ts-ignore
                <textarea {...newProps} rows={7} />
            )}
        </div>
    );
};

export default Input;
