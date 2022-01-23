import Button, { ButtonProps } from "./Button";

const PrimaryButton = (props: ButtonProps) => {
    let newProps = { ...props }
    newProps.className += ` bg-green-400 rounded-md text-white ${(!props.disabled && !props.isLoading) && "hover:bg-black"} transition`
    newProps.childClassName += " px-2 py-1"
    return <Button {...newProps} />
}

export default PrimaryButton
