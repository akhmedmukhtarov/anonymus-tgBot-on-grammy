import {Bot} from 'grammy'
import { controller } from './controller/controller';

const bot = new Bot('6198975010:AAHfeVMNB3siZMHyOBBqA59Jgq-ZOXgI_1k')



bot.command('start', controller.startReply)

bot.command('newusername',controller.insertUsername)

bot.on('message',controller.setUsername)



bot.start();

export{bot}