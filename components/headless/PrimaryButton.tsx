import Button from "./Button";

const PrimaryButton = (props: (React.HTMLProps<HTMLButtonElement> | React.HTMLProps<HTMLAnchorElement>)
& {isLoading?: boolean}) => {
    return (
        <Button 
            className={`bg-green-400 rounded-md text-white ${(!props.disabled && !props.isLoading) && "hover:bg-black"} transition`}
            childClassName="px-2 py-1"
            {...props}
        />
    )
}

export default PrimaryButton
