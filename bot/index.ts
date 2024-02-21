import { Bot, Config, readConfig } from "./src/init";



async function main() {
    await readConfig();

    const bot = new Bot(Config.BOT_TOKEN);
    bot.initMemCache();
    bot.run();
}

main();