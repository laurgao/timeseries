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

const sumDigits = (n: number) => n.toString().split("").map(Number).reduce((a, b) => (a + b), 0)
const mulDigits = (n: number) => n.toString().split("").map(Number).reduce((a, b) => (a * b), 1)

// const colorIndex = Math.floor(Math.random() * tailwindColors.length - 1) + 1;
const getPseudoRandomNumber = (date: Date) => {
    var index = 1
    index *= sumDigits(date.getDate())
    index *= sumDigits(date.getMonth() + 1)
    index *= sumDigits(date.getFullYear())
    return index - 1
}
const today = new Date()
const colorIndex = getPseudoRandomNumber(today) % (tailwindColors.length - 1)

export const color = tailwindColors[colorIndex];
export default tailwindColors;
