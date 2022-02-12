import React, { ReactNode } from "react";

export type SelectProps = Omit<React.HTMLProps<HTMLSelectElement>, "default"> & { options: { value: any; label: string | ReactNode }[], default?: string, optionsClassName?: string };

const Select = ({ options, ...props }: SelectProps) => {
    let newProps = { ...props }
    newProps.className += ` border-b w-full p-2 ` + (props.value === "" && "text-gray-400")
    delete newProps.optionsClassName
    return (
        <select {...newProps}>
            <option value="" className={"text-gray-400 " + props.optionsClassName}>
                {props.default || "Choose a value"}
            </option>
            {options.map((o) => (
                <option value={o.value} key={o.value} className={props.optionsClassName}>
                    {o.label}
                </option>
            ))}
        </select>
    );
};

export default Select;
