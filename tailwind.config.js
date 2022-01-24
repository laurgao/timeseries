// import { tailwindColors } from "./utils/utils";
// let tailwindColors = require("./utils/utils");
// let tailwindColors = require("./utils/utils").tailwindColors;

const tailwindColors = [
    "red",
    "orange",
    "amber",
    "yellow",
    "lime",
    "green",
    "emerald",
    "teal",
    "cyan",
    "sky",
    "blue",
    "indigo",
    "violet",
    "purple",
    "pink",
    "fuchsia",
    "rose",
];

module.exports = {
    content: ["./**/*.html", "./**/*.tsx"],
    safelist: tailwindColors.map((color) => `bg-${color}-400`),
    theme: {
        container: {
            center: true,
            padding: "1rem",
        },
    },
    plugins: [],
};
