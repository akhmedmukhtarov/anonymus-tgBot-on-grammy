import {Bot} from 'grammy'
import { controller } from './controller/controller';

const bot = new Bot('6198975010:AAHfeVMNB3siZMHyOBBqA59Jgq-ZOXgI_1k')



bot.command('start', controller.startReply)

bot.command('search',controller.findPartner)

bot.command('stop', controller.stopConversation)

bot.command('skip',controller.skip)

bot.command('rules', controller.sendRules)

bot.command('newusername',controller.sendSetUsernameMessage)

bot.hears('Yangi ism tanlayman🥷',controller.sendInsertUsername)

bot.hears(`O'z ismimda qolaman🤵‍♂️`, controller.continueWithOwnUsername)

bot.hears(`Suhbatdosh izlash🔍`, controller.findPartner)

bot.on('::hashtag',controller.setUsername)

bot.on('callback_query:data', controller.callbackHandler)

bot.on('message',controller.chatRoom)






bot.start();

export{bot}