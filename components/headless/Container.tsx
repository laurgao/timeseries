import { ReactNode } from "react";

export default function Container({
    children,
    className,
    width = "4xl",
    padding = 4,
    style,
}: {
    children: ReactNode;
    className?: string;
    width?: "xl" | "4xl" | "5xl" | "7xl" | "full";
    padding?: 4 | 6 | 8 | 10 | 12;
    style?;
}) {
    return (
        <div
            className={
                "mx-auto p-4 " +
                {
                    4: "",
                    6: "sm:px-6 ",
                    8: "sm:px-8 ",
                    10: "sm:px-10 ",
                    12: "sm:px-12 ",
                }[padding] +
                {
                    xl: "max-w-xl ",
                    "4xl": "max-w-4xl ",
                    "5xl": "max-w-5xl ",
                    "7xl": "max-w-7xl ",
                    full: " ",
                }[width] +
                (className || "")
            }
            style={style}
        >
            {children}
        </div>
    );
}
