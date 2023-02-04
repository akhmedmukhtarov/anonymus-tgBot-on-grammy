import {Bot} from 'grammy'
import { controller } from './controller/controller';

const bot = new Bot('6198975010:AAHfeVMNB3siZMHyOBBqA59Jgq-ZOXgI_1k')



bot.command('start', controller.startReply)

bot.command('newusername',controller.sendInsertUsername)

bot.on('message',controller.setUsername)

bot.hears('Set new username', controller.sendInsertUsername)



bot.start();

export{bot}