// Case insensitive search from https://stackoverflow.com/questions/1863399/mongodb-is-it-possible-to-make-a-case-insensitive-query
export const caseInsensitiveRegex = (seriesName: string) => ({ $regex: `^${seriesName}$`, $options: "i" });
