import { Composer } from "telegraf";
import { SendStartKeyboard } from "../utils";

const composer = new Composer();

composer.start(async (ctx) => {
    SendStartKeyboard(ctx, "Books bot 🐵 ");
});


export default composer;