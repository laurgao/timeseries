import React from "react";

export type SelectProps = React.HTMLProps<HTMLSelectElement> & { options: { value: any; label: string }[] };

const Select = ({ options, ...props }: SelectProps) => {
    return (
        <select className={`border-b w-full focus:outline-none outline-none ${!props.value && "opacity-30"}`} {...props}>
            <option value="" className="text-gray-400">
                Choose a value
            </option>
            {options.map((o) => (
                <option value={o.value} key={o.value} className="focus:outline-none outline-none py-4">
                    {o.label}
                </option>
            ))}
        </select>
    );
};

export default Select;
