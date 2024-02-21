import { Composer, Markup, Scenes, session } from "telegraf";
import { memCache } from "../init";
import { DeleteMessage, Send, SendD, SendStartKeyboard } from "../utils";
import { SearchBook, SearchBookByKeyPhrase } from "../api";
import { AddBook, AddBookInitButtons } from "./addBook";
import { DeleteBook, GetGenres } from "../api";

const composer = new Composer<Scenes.WizardContext>();

export const enum EScenes {
    DefaultSearchBookScene = "default-search-book-scene", // default book search ( title + author (optional))
    PhraseSearchBookScene = "phrase-search-book-scene", // search book by key phrase 
    AddBookScene = "add-book-scene",
    GetBookGenreScene = "get-book-genre-scene",
    DeleteBookScene = "get-book-scene",
}

/* defqult book search */
const DefaultSearchBookWizard = new Scenes.WizardScene(
    EScenes.DefaultSearchBookScene,
    async (ctx) => {
        await SendD(ctx, "Отправь название книги: ⬇️");
        return ctx.wizard.next();
    },
    async (ctx) => {
        if (ctx.message && 'text' in ctx.message) {
            var key = Date.now().toString();
            memCache.put("SearchSession", key, ctx.from?.id);
            memCache.put("BookTitle", ctx.message.text, ctx.from?.id);


            await ctx.reply("Отправь автора книги: ⬇️", Markup.inlineKeyboard(
                [Markup.button.callback("Без автора", "no_author:" + key)]
            ));
            return ctx.wizard.next();
        }
    }, async (ctx) => {
        if (ctx.message && 'text' in ctx.message) {
            var title = memCache.get("BookTitle", ctx.from?.id);
            if (title === null) {
                await SendStartKeyboard(ctx, "😢 Ошибка при поиске книги...");
                return ctx.scene.leave();
            }

            const response = await SearchBook(title, ctx.message.text);
            if (!response) {
                await SendStartKeyboard(ctx, "😢 Ошибка при поиске книги...");
                return ctx.scene.leave();
            }

            if (response.error) {
                await SendStartKeyboard(ctx, "😢 Ошибка при поиске книги...\nПричина: " + response.message);
                return ctx.scene.leave();
            }

            response.books?.forEach(async (book) => {
                await SendStartKeyboard(ctx, `📖 ***${book.title}***\n***Автор***: \`${book.author}\`\n***Жанр***: \`${book.genre}\`\n***Описание***: \`${book.description}\`\n***Время добавления***: \`${book.addTimestamp}\``, true);
            });


            return ctx.scene.leave();
        }
    },
);


DefaultSearchBookWizard.action(/no_author:(.+)/, async (ctx) => {
    if (ctx.match[1] != memCache.get("SearchSession", ctx.from?.id)) {
        return;
    }

    try {
        await ctx.deleteMessage();
    } catch { }

    var title = memCache.get("BookTitle", ctx.from?.id);
    if (title === null) {
        await SendStartKeyboard(ctx, "😢 Ошибка при поиске книги...");
        return ctx.scene.leave();
    }

    const response = await SearchBook(title);
    if (!response) {
        await SendStartKeyboard(ctx, "😢 Ошибка при поиске книги...");
        return ctx.scene.leave();
    }

    if (response.error) {
        await SendStartKeyboard(ctx, "😢 Ошибка при поиске книги...\nПричина: " + response.message);
        return ctx.scene.leave();
    }

    response.books?.forEach(async (book) => {
        await SendStartKeyboard(ctx, `📖 ***${book.title}***\n***Автор***: \`${book.author}\`\n***Жанр***: \`${book.genre}\`\n***Описание***: \`${book.description}\`\n***Время добавления***: \`${book.addTimestamp}\``, true);
    });

    try {
        return ctx.scene.leave();
    } catch { }
});


/*  search book by key phrase */
const PhraseSearchBookWizard = new Scenes.WizardScene(
    EScenes.PhraseSearchBookScene,
    async (ctx) => {
        await SendD(ctx, "Отправь ключевое слово/фразу ⬇️");
        return ctx.wizard.next();
    },
    async (ctx) => {
        if (ctx.message && 'text' in ctx.message) {
            const response = await SearchBookByKeyPhrase(ctx.message.text);
            if (!response) {
                await SendStartKeyboard(ctx, "😢 Ошибка при поиске книги...");
                return ctx.scene.leave();
            }

            if (response.error) {
                await SendStartKeyboard(ctx, "😢 Ошибка при поиске книги...\nПричина: " + response.message);
                return ctx.scene.leave();
            }

            response.books?.forEach(async (book) => {
                await SendStartKeyboard(ctx, `📖 ***${book.title}***\n***Автор***: \`${book.author}\`\n***Жанр***: \`${book.genre}\`\n***Описание***: \`${book.description}\`\n***Время добавления***: \`${book.addTimestamp}\``, true);
            });


            try {
                return ctx.scene.leave();
            } catch { }
        }
    }
);



/*  add book*/
const AddBookWizard = new Scenes.WizardScene(
    EScenes.AddBookScene,
    async (ctx) => {
        await Send(ctx, "Отправь название книги ⬇️");
        return ctx.wizard.next();
    },
    async (ctx) => {
        if (ctx.message && 'text' in ctx.message) {
            var key = Date.now().toString();
            memCache.put("AddBookSession", key, ctx.from?.id);
            memCache.put("AddBookTitle", ctx.message.text, ctx.from?.id);

            await ctx.reply("Отправь автора книги ⬇️");
            return ctx.wizard.next();
        }
    }, async (ctx) => {
        if (ctx.message && 'text' in ctx.message) {
            memCache.put("AddBookAuthor", ctx.message.text, ctx.from?.id);
            await ctx.reply("Отправь описание книги ⬇️");
            return ctx.wizard.next();
        }
    }, async (ctx) => {
        if (ctx.message && 'text' in ctx.message) {
            memCache.put("AddBookDescription", ctx.message.text, ctx.from?.id);

            const key = memCache.get("AddBookSession", ctx.from?.id);
            if (!key) {
                await SendStartKeyboard(ctx, "😢 Ошибка при получении ключа сессии...");
                return await ctx.scene.leave();
            }


            const response = await GetGenres();
            if (!response) {
                await SendStartKeyboard(ctx, "😢 Ошибка при получении жанров...");
                return await ctx.scene.leave();
            }

            if (response.genres == null) {
                const buttons = AddBookInitButtons(null, key);
                await ctx.reply("Выбери нужный жанр или укажи свой ⬇️", Markup.inlineKeyboard([...buttons]));
                return;
            }

            if (response.error) {
                await SendStartKeyboard(ctx, "😢 Ошибка при получении жанров...\nПричина: " + response.message);
                return await ctx.scene.leave();
            }


            const buttons = AddBookInitButtons(response.genres, key);
            await ctx.reply("Выбери нужный жанр или укажи свой ⬇️", Markup.inlineKeyboard([...buttons]));

        }
    }
);


const GetBookGenreWizard = new Scenes.WizardScene(
    EScenes.GetBookGenreScene,
    async (ctx) => {
        await ctx.reply("Отправь название жанра ⬇️");
        return ctx.wizard.next();
    },
    async (ctx) => {
        if (ctx.message && 'text' in ctx.message) {

            const title = memCache.get("AddBookTitle", ctx.from?.id);
            const author = memCache.get("AddBookAuthor", ctx.from?.id);
            const description = memCache.get("AddBookDescription", ctx.from?.id);

            if (title === null || author === null || description === null) {
                try {
                    await ctx.scene.leave();
                } catch { }

                return await SendStartKeyboard(ctx, "😢 Ошибка при получении данных о книге");
            }

            try {
                await AddBook(title, author, ctx.message.text, description);
            } catch (error) {
                try {
                    await ctx.scene.leave();
                } catch { }

                return await SendStartKeyboard(ctx, "😢 Ошибка при сохранении книги: " + error);
            }


            await SendStartKeyboard(ctx, "✅ Книга успешно сохранена");

            try {
                return ctx.scene.leave();
            } catch { }

        }
    }
);


const DeleteBookWizard = new Scenes.WizardScene(
    EScenes.DeleteBookScene,
    async (ctx) => {
        await Send(ctx, "Отправь название книги: ⬇️");
        return ctx.wizard.next();
    },
    async (ctx) => {
        if (ctx.message && 'text' in ctx.message) {
            try {
                const res = await DeleteBook(ctx.message.text);
                if (res?.error) {
                    await SendStartKeyboard(ctx, "😢 Ошибка при удалении книги. Причина: " + res.message);
                    return await ctx.scene.leave();
                }
            } catch (error) {
                try {
                    await ctx.scene.leave();
                } catch { }

                // return await SendStartKeyboard(ctx, "😢 Ошибка при удалении книги: " + error);
            }

            await SendStartKeyboard(ctx, "✅ Книга успешно удалена");

            try {
                return ctx.scene.leave();
            } catch { }
        }
    }
);



/* genre handler */
AddBookWizard.action(/addBook:(.+)/, async (ctx) => {
    DeleteMessage(ctx);

    const match = ctx.match[1]; /* customGenre or genre */
    const sessionKey = match.split("_")[1];
    const genre = match.split("_")[0];

    if (sessionKey != memCache.get("AddBookSession", ctx.from?.id)) {
        return;
    }

    if (genre == "customGenre") {
        try {
            await ctx.scene.leave();
        } catch { }

        return await ctx.scene.enter(EScenes.GetBookGenreScene);
    }

    const title = memCache.get("AddBookTitle", ctx.from?.id);
    const author = memCache.get("AddBookAuthor", ctx.from?.id);
    const description = memCache.get("AddBookDescription", ctx.from?.id);

    if (title === null || author === null || description === null) {
        try {
            await ctx.scene.leave();
        } catch { }

        return await SendStartKeyboard(ctx, "😢 Ошибка при получении данных о книге");
    }



    try {
        await AddBook(title, author, genre, description);
    } catch (error) {
        try {
            await ctx.scene.leave();
        } catch { }

        return await SendStartKeyboard(ctx, "😢 Ошибка при сохранении книги: " + error);
    }


    await SendStartKeyboard(ctx, "✅ Книга успешно сохранена");

    try {
        await ctx.scene.leave();
    } catch { }


});






// @ts-ignore
const stage = new Scenes.Stage<Scenes.WizardContext>([DefaultSearchBookWizard, PhraseSearchBookWizard, AddBookWizard, GetBookGenreWizard, DeleteBookWizard])
    .hears("❌ Отмена", async (ctx) => {
        await SendStartKeyboard(ctx, "❌ Отмена");

        try {
            await ctx.scene.leave();
        } catch { }
    });


composer.use(session());
// @ts-ignore;
composer.use(stage.middleware());



export default composer;