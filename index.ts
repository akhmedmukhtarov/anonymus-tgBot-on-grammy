import {Bot} from 'grammy'
import { startReply } from './controller/controller';

const bot = new Bot('6198975010:AAHfeVMNB3siZMHyOBBqA59Jgq-ZOXgI_1k')



bot.command('start', startReply)

bot.on("message", (ctx) => ctx.reply("Got another message!"));


bot.start();

export{bot}