import { Composer, Markup, Scenes } from "telegraf";
import { Config, memCache } from "../init";
import { EScenes } from "./wizard";
import axios, { AxiosError } from "axios";

const composer = new Composer<Scenes.WizardContext>();


type AddBookResponse = {
    error: boolean;
    message?: string;
};


composer.hears("📖 Добавить книгу", async (ctx) => {
    await ctx.scene.enter(EScenes.AddBookScene);
});


export async function AddBook(title: string, author: string, genre: string, description: string) {

    var url: string = "http://" + Config.API_IP + ":" + Config.API_PORT + "/addBook?title=" + title + "&author=" + author + "&genre=" + genre + "&description=" + description;


    try {
        const { data, status } = await axios.get<AddBookResponse>(
            url,
            {
                headers: {
                    Accept: 'application/json',
                },
            });
        if (status != 200) {
            throw "status != 200";
        }

    } catch (error) {
        const err = error as Error | AxiosError;

        if (err instanceof AxiosError) {
            const message = err.response?.data;
            throw message.message;
        }

        throw error;
    }

};



/*
 creates buttons 
 arr == null means there are no genres
*/
export function AddBookInitButtons(arr: Array<string> | null | undefined, sessionKey: string): any {

    const buttons = [];

    if (arr != null) {
        for (let i = 0; i < arr.length; i++) {
            if (i > 8) {
                continue;
            }
            if (i % 3 == 0) {
                buttons.push([Markup.button.callback(arr[i], "addBook:" + arr[i] + "_" + sessionKey)]);
            } else {
                buttons[buttons.length - 1].push(Markup.button.callback(arr[i], "addBook:" + arr[i] + "_" + sessionKey));
            }
        }
    }

    buttons.push([Markup.button.callback("📚 Указать другой жанр", "addBook:customGenre_" + sessionKey)]);

    return buttons;
}

export default composer;
