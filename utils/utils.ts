// Case insensitive search from https://stackoverflow.com/questions/1863399/mongodb-is-it-possible-to-make-a-case-insensitive-query
export const caseInsensitiveRegex = (seriesName: string) => ({ $regex: `^${seriesName}$`, $options: "i" });

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

const colorIndex = Math.floor(Math.random() * tailwindColors.length - 1) + 1;
export const color = tailwindColors[colorIndex];
export default tailwindColors;
