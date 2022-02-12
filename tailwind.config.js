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

let safelist = [];
for (let color of tailwindColors) {
    safelist.push(`bg-${color}-400`); // primary button bg
    safelist.push(`hover:text-${color}-400`); // a tags
    safelist.push(`text-${color}-500`); // a tags
    safelist.push(`text-${color}-900`); // select
    safelist.push(`bg-${color}-100`); // select
    safelist.push(`text-${color}-600`); // select
}

module.exports = {
    content: ["./**/*.html", "./**/*.tsx"],
    safelist: safelist,
    theme: {
        container: {
            center: true,
            padding: "1rem",
        },
    },
    plugins: [],
};
