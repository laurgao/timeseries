import { color } from "../../utils/utils";
import Button, { ButtonProps } from "../headless/Button";

const PrimaryButton = (props: ButtonProps) => {
    let newProps = { ...props };
    newProps.className += ` bg-${color}-400 rounded-md text-white ${!props.disabled && !props.isLoading && "hover:bg-black"} transition`;
    newProps.childClassName += " px-2 py-1";
    return <Button {...newProps} />;
};

export default PrimaryButton;
