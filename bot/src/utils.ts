import { Context, Markup } from "telegraf";

/* deletes the message and sends a new message with cancel button */
export async function SendD(ctx: Context, text: string): Promise<void> {
    await DeleteMessage(ctx);
    await Send(ctx, text);

}

/* deletes message */
export async function DeleteMessage(ctx: Context): Promise<void> {
    try {
        await ctx.deleteMessage();
    } catch {
    }
}


/* sends a message with cancel button */
export async function Send(ctx: Context, text: string): Promise<void> {
    try {
        await ctx.reply(text, {
            reply_markup: {
                keyboard: [
                    [
                        { text: "❌ Отмена" }
                    ]
                ], resize_keyboard: true
            }
        });
    } catch { }
}



/* sends start keyboard */
export async function SendStartKeyboard(ctx: Context, text: string, markdown?: boolean): Promise<void> {
    try {

        if (markdown) {
            await ctx.replyWithMarkdownV2(text, {
                reply_markup: {
                    keyboard: [
                        [
                            { text: "📖 Найти книгу" },
                            { text: "📖 Добавить книгу" }
                        ], [
                            { text: "📖 Просмотр списка книг" }
                        ], [
                            { text: "📖 Удалить книгу" }

                        ]
                    ],
                    resize_keyboard: true
                }
            });
        } else {
            await ctx.reply(text, {
                reply_markup: {
                    keyboard: [
                        [
                            { text: "📖 Найти книгу" },
                            { text: "📖 Добавить книгу" }
                        ], [
                            { text: "📖 Просмотр списка книг" }
                        ], [
                            { text: "📖 Удалить книгу" }

                        ]
                    ],
                    resize_keyboard: true
                }
            });
        }

    } catch {
    }
}