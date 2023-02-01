import {bot} from '../index'
async function startReply(ctx:any): Promise<void>{
    const startText: string = `Hello there! I\'m your bot, to chat with other telegram users anonymusly`
    ctx.reply(startText)
    console.log();
    const sendMessage:string = `Would yo like to change your username or continue as ${ctx.message?.from.first_name}`
    // bot.api.sendMessage(ctx.message.chat.id,sendMessage,{reply_markup:{one_time_keyboard: true}})
    ctx.reply()
}

// su


export {startReply}