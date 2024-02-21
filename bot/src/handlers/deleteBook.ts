import { Composer, Scenes } from "telegraf";
import { EScenes } from "./wizard";

const composer = new Composer<Scenes.WizardContext>();

composer.hears("📖 Удалить книгу", async (ctx) => {
    await ctx.scene.enter(EScenes.DeleteBookScene);
});


export default composer;