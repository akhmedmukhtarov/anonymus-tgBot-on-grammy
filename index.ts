import {Bot} from 'grammy'
import { controller } from './controller/controller';

const bot = new Bot('6198975010:AAHfeVMNB3siZMHyOBBqA59Jgq-ZOXgI_1k')



bot.command('start', controller.startReply)

bot.command('search')

bot.command('stop')

bot.command('skip')

bot.command('help')

bot.command('newusername',controller.sendSetUsernameMessage)

bot.hears('Set new username',controller.sendInsertUsername)

bot.hears('Continue with own username', controller.continueWithOwnUsername)

bot.hears('Find a partner', controller.findPartner)

bot.on('::hashtag',controller.setUsername)

bot.on('message',controller.chatRoom)






bot.start();

export{bot}