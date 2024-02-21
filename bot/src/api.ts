import axios, { AxiosError } from "axios";
import { Config } from "./init";


export type Book = {
    title: string,
    author: string;
    genre: string,
    description: string,
    addTimestamp: string;
};

type GetGenresResponse = {
    error: boolean;
    message?: string;
    genres?: Array<string>;
};

type DefaultBookResponse = {
    error: boolean;
    message?: string;
    books?: Array<Book>;
};

type DeleteBookResponse = {
    error: boolean;
    message?: string;
};


export async function GetGenres(): Promise<GetGenresResponse | null> {
    return sendRequest<GetGenresResponse>("/getGenres");
}

export async function ViewAllBooks(): Promise<DefaultBookResponse | null> {
    var path: string = "/viewBooks?fields=title,author,genre,description,addTimestamp&count=-1";
    return sendRequest<DefaultBookResponse>(path);
}

export async function DeleteBook(title: string): Promise<DeleteBookResponse | null> {
    var path: string = "/deleteBook?title=" + title;
    return sendRequest<DeleteBookResponse>(path);
}

export async function SearchBook(title: string, author?: string): Promise<DefaultBookResponse | null> {
    var path: string = "/getBook?title=" + title;
    path += author != undefined ? "&author=" + author : "";
    return sendRequest<DefaultBookResponse>(path);
}

export async function SearchBookByKeyPhrase(phrase: string): Promise<DefaultBookResponse | null> {
    return sendRequest<DefaultBookResponse>("/getBook?keyPhrase=" + phrase);
}

// sends request to api
async function sendRequest<T>(path: string): Promise<T | null> {
    var url: string = "http://" + Config.API_IP + ":" + Config.API_PORT + path;

    try {
        const { data } = await axios.get<T>(
            url,
            {
                headers: {
                    Accept: 'application/json',
                },
            },);
        return data;
    } catch (error) {
        const err = error as Error | AxiosError;
        if (err instanceof AxiosError) {
            const message = err.response?.data;
            return message;
        }
    }

    return null;
}
