import { Composer, Markup, Scenes } from "telegraf";
import { rmSync } from "fs";
import { Book, GetGenres, ViewAllBooks } from "../api";

const composer = new Composer<Scenes.WizardContext>();


composer.hears("📖 Просмотр списка книг", async (ctx) => {
    await ctx.reply("Нажмите на нужную вам кнопку", {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "🔍 Просмотреть все книги", callback_data: "view:all" },
                ], [
                    { text: "🔍 Просмотреть книги по жанру", callback_data: "view:byGenre" }
                ]
            ]
        }
    });
});



composer.action(/view:(.+)/, async (ctx) => {
    try {
        await ctx.deleteMessage();
    } catch {
    }

    const viewType = ctx.match[1];

    if (viewType == "all") {
        const response = await ViewAllBooks();
        if (!response || !response.books) {
            await ctx.reply("😢 Ошибка при поиске книг...");
            return;
        }

        if (response.error) {
            await ctx.reply("😢 Ошибка при поиске книг...\nПричина: " + response.message);
            return ctx.scene.leave();
        }

        const path = "./temp/" + Bun.nanoseconds() + ctx.from?.id + ".json";

        await Bun.write(path, JSON.stringify(response.books, null, 2));

        await ctx.replyWithDocument({
            source: path,
        }, { caption: "⬆️ JSON файл с книгами" });

        rmSync(path);
    } else {
        const response = await GetGenres();
        if (!response || !response.genres) {
            await ctx.reply("😢 Ошибка при поиске книг...");
            return;
        }

        if (response.error) {
            await ctx.reply("😢 Ошибка при поиске книг...\nПричина: " + response.message);
            return ctx.scene.leave();
        }


        const buttons = initButtons(response?.genres);
        await ctx.reply("Выбери нужный жанр ⬇️", Markup.inlineKeyboard([...buttons]));

    }
});



composer.action(/viewByGenre:([^]+)/, async (ctx) => {
    const genre = ctx.match[1];
    const books: Array<Book> = [];

    try {
        await ctx.deleteMessage();
    } catch { }



    const response = await ViewAllBooks();
    if (!response || !response) {
        await ctx.reply("😢 Ошибка при поиске книг...");
        return;
    }

    if (response.error) {
        await ctx.reply("😢 Ошибка при поиске книг...\nПричина: " + response.message);
        return ctx.scene.leave();
    }


    for (let key in response.books) {
        let book = response.books[+key];
        if (book.genre == genre) {
            books.push(book);
        }
    }


    const path = "./temp/" + Bun.nanoseconds() + ctx.from?.id + ".json";

    await Bun.write(path, JSON.stringify(books, null, 2));

    await ctx.replyWithDocument({
        source: path,
    }, { caption: `⬆️ JSON файл с книгами с жанром "${genre}"` });

    rmSync(path);


});


function initButtons(arr: Array<string>): any {
    const buttons = [];

    for (let i = 0; i < arr.length; i++) {
        if (i > 8) {
            continue;
        }

        if (i % 3 == 0) {
            buttons.push([Markup.button.callback(arr[i], "viewByGenre:" + arr[i])]);
        } else {
            buttons[buttons.length - 1].push(Markup.button.callback(arr[i], "viewByGenre:" + arr[i]));
        }
    }


    return buttons;
}

export default composer;