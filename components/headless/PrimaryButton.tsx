import Button from "./Button";

const PrimaryButton = (props: (React.HTMLProps<HTMLButtonElement> | React.HTMLProps<HTMLAnchorElement>)
& {isLoading?: boolean}) => {
    return (
        <Button 
            containerClassName={`bg-green-400 rounded-md text-white ${(!props.disabled && !props.isLoading) && "hover:bg-black"} transition`}
            childClassName="py-4 px-3"
            {...props}
        />
    )
}

export default PrimaryButton
