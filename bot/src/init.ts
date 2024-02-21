import { Scenes, Telegraf } from "telegraf";
import yaml from 'js-yaml';
import start from "./handlers/start";
import search from "./handlers/searchBook";
import wizard from "./handlers/wizard";
import addBook from './handlers/addBook';
import viewBooks from './handlers/viewBooks';
import deleteBook from './handlers/deleteBook';
import MemCache from "./memCache";


interface IConfig {
    API_IP: string;
    API_PORT: number;
    BOT_TOKEN: string;
}

// keyName_userId_unixTime , value 
var memCache: MemCache;
var Config: IConfig;


class Bot {
    private bot: Telegraf<Scenes.WizardContext<Scenes.WizardSessionData>>;

    constructor(token: string) {
        this.bot = new Telegraf<Scenes.WizardContext>(token);

        /* init composers */
        this.bot.use(wizard);
        this.bot.use(start);
        this.bot.use(search);
        this.bot.use(addBook);
        this.bot.use(viewBooks);
        this.bot.use(deleteBook);

    };

    initMemCache(): void {
        memCache = new MemCache();
    }


    run(): void {
        console.log("Bot started");

        this.bot.catch(err => {
            console.log("Error: " + err);
        });
        this.bot.launch();

    }

}

async function readConfig(): Promise<void> {
    const file = Bun.file("../config.yml");
    Config = yaml.load(await file.text()) as IConfig;
}


export {
    Config,
    memCache,
    Bot,
    readConfig,
};

