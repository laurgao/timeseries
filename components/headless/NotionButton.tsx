import { FaPlus } from "react-icons/fa";
import Button from "./Button";

const NotionButton = ({onClick, children} : {
    onClick: () => any,
    children: string
}) => {
    return (
        <Button containerClassName="opacity-40 transition cursor-pointer py-4 px-3 hover:bg-gray-100 rounded-xl w-full" onClick={onClick}>
            <div className="flex items-center">
                <FaPlus/>
                <p className="ml-2.5">{children}</p>
            </div>
        </Button>
    )
}

export default NotionButton
