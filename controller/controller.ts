import {bot} from '../index'
import {connection} from '../database/database'

type User = {
    ID: number,
    Username: string,
    FirstName: string,
    LastName: string,
    BotUsername: string,
    Date: string
}


async function sendSetUsernameMessage(ctx:any): Promise<void> {
    const sendMessage:string = `Would yo like to change your username or continue as ${ctx.message?.from.first_name}`
        await bot.api.sendMessage(ctx.message.chat.id,sendMessage,{reply_markup:{
            force_reply: true,
            keyboard: [[`Continue as **${ctx.message?.from.first_name}**`],['/newusername']],
            one_time_keyboard: true,
        }})
}


async function startReply(ctx:any): Promise<void>{
    try{
        const startText: string = `Hello there! I\'m your bot, to chat with other telegram users anonymusly`
        await ctx.reply(startText)
        sendSetUsernameMessage(ctx)
    }catch(err){
        console.log(err);
    }
}

async function insertUsername(ctx:any): Promise<void>{
    bot.api.sendMessage(ctx.message.chat.id, 'Insert username',{
        reply_markup:{
            force_reply: true,
            input_field_placeholder: 'Insert new username'
        }
    })
}


async function setUsername(ctx:any):Promise<void>{
    try{
        const userID:number = ctx.message.from.id
        const firstName:string = ctx.message.from.first_name;
        const lastName:string = ctx.message.from.last_name;
        const username:string = ctx.message.from.username;
        const text:string = ctx.message.text
        if(text === `Continue as **${firstName}**`){
            const db = await connection
            const sql:string = 'INSERT INTO Users (ID,FirstName,LastName,Username,BotUSername,Date) VALUES(?,?,?,?,?,?)'
            db.query(sql,[userID,firstName,lastName,username,firstName,Date()])
        }
        if(ctx.message.reply_to_message){
            const messageRepliedTo:string = ctx.message.reply_to_message.from.username
            const repliedText:string = ctx.message.reply_to_message.text
            const newUsername:string = ctx.message.text
            if(messageRepliedTo === 'zeus_chat_bot' && repliedText === 'Insert username'){
                const db = await connection
                const sql:string = 'INSERT INTO Users (ID,FirstName,LastName,Username,BotUSername,Date) VALUES(?,?,?,?,?,?)'
                db.query(sql,[userID,firstName,lastName,username,newUsername,Date()])
            }
        }
        
    }catch(err){
        console.log(err);
    }
}



const controller =  {
    startReply,
    insertUsername,
    setUsername,
}

export{controller}