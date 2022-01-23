import { FaPlus } from "react-icons/fa";
import Button, { ButtonProps } from "./Button";

const NotionButton = (props: Omit<ButtonProps, "childClassName">) => {
    let newProps = { ...props };
    newProps.className += ` opacity-40 transition cursor-pointer py-4 px-3 hover:bg-gray-100 rounded-xl w-full`;
    delete newProps.children;
    return (
        // @ts-ignore idk why this doesn't work but i'll fio later.
        <Button {...newProps} childClassName="flex items-center">
            <>
                <FaPlus />
                <p className="ml-2.5">{props.children}</p>
            </>
        </Button>
    );
};

export default NotionButton;
