import Button from "./Button";

const PrimaryButton = (props: (React.HTMLProps<HTMLButtonElement> | React.HTMLProps<HTMLAnchorElement>)
& {isLoading?: boolean}) => {
    return (
        <Button 
            containerClassName="bg-green-400 disabled:bg-green-400 rounded-md text-white hover:bg-black transition"
            childClassName="py-4 px-3"
            {...props}
        >

        </Button>
    )
}

export default PrimaryButton
