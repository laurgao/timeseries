import { Dispatch, SetStateAction } from "react";
import H3 from "./H3";

type InputProps = (React.HTMLProps<HTMLInputElement>) & {
    setValue?: Dispatch<SetStateAction<string>>;
    name?: string;
    childClassName?: string;
};

const Input = (props: InputProps) => {
    let newProps = { ...props };
    // @ts-ignore property value exists on e.target
    if (newProps.setValue) newProps.onChange = (e) => props.setValue(e.target.value);
    newProps.className = props.childClassName + " border-b w-full my-2 py-2"
    delete newProps.childClassName;
    delete newProps.name;
    delete newProps.setValue;
    return (
        <div className={props.className}>
            {props.name && <H3>{props.name}</H3>}
            <input {...newProps} />
        </div>
    );
};

export default Input;
