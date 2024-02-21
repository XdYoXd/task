import { Composer, Markup, Scenes } from "telegraf";
import { memCache } from "../init";
import { EScenes } from "./wizard";

const composer = new Composer<Scenes.WizardContext>();

composer.hears("📖 Найти книгу", async (ctx) => {
    await ctx.reply("Выберите тип поиска", Markup.inlineKeyboard([
        Markup.button.callback("🔎 Стандартный поиск", "search:default"),
        Markup.button.callback("🔎 Поиск по ключевой фразе", "search:keyPhrase")
    ], { columns: 1 }));

});

composer.action(/search:(.+)/, async (ctx) => {
    ctx.answerCbQuery();
    const searchType = ctx.match[1];

    memCache.put("searchType", searchType, ctx.from?.id);

    if (searchType == "default") {
        ctx.scene.enter(EScenes.DefaultSearchBookScene);
    } else {
        await ctx.scene.enter(EScenes.PhraseSearchBookScene);
    }
});


export default composer;