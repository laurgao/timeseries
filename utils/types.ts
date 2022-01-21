export interface UserObj {
    email: string,
    username: string,
    name: string,
    image: string,
}

export interface NoteObj {
    body: string; 
    date: string; 
    series: string; // id of series
}

export interface SeriesObj {
    user: string; 
    title: string; 
    privacy: "private" | "publicVisible" | "publicCanEdit"; 
}

export interface SessionObj {
    user: {
        name: string,
        email: string,
        image: string,
    },
    userId: string,
    username: string,
}

// generic / type alias from https://stackoverflow.com/questions/26652179/extending-interface-with-generic-in-typescript
export type DatedObj<T extends {}> = T & {
    _id: string,
    createdAt: string, // ISO date
    updatedAt: string, // ISO date
}

export type IdObj<T extends {}> = T & {
    _id: string,
}