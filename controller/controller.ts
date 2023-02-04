import {bot} from '../index'
import {connection} from '../database/database'

type User = [{
    ID: number,
    Username: string,
    FirstName: string,
    LastName: string,
    BotUsername: string,
    Date: string
}]

type Chat = [{
    ID: number,
    FirstUserID: number,
    SecondUSerID: number,
    Date: string,
    CancelledBy: null|string
}]


async function sendSetUsernameMessage(ctx:any): Promise<void> {
    try{
        const sendMessage:string = `Would yo like to change your username or continue as ${ctx.message?.from.first_name}`
        await bot.api.sendMessage(ctx.message.chat.id,sendMessage,{reply_markup:{
            force_reply: true,
            keyboard: [[`Continue as ${ctx.message?.from.first_name}`],['Set new username']],
            one_time_keyboard: true,
        }})
    }catch(err){
        console.log(err);
    }
}

async function sendFindPArtnerButton(ctx:any ,string:string): Promise<void>{
    bot.api.sendMessage(ctx.message.chat.id,string,{reply_markup:{
        keyboard: [[`Find a partner`],['/Find adlakhf partner']],
    }})
}

async function sendInsertUsername(ctx:any): Promise<void>{
    try{
        bot.api.sendMessage(ctx.message.chat.id, 'Insert username',{
            reply_markup:{
                force_reply: true,
                input_field_placeholder: 'Insert new username'
            }
        })
    }catch(err){
        console.log(err);
        
    }
}

async function startReply(ctx:any): Promise<void>{
    try{
        const startText: string = `Hello there! I\'m your bot, to chat with other telegram users anonymusly`
        const UserID:number = ctx.message.from.id
        const user = await getUserByID(UserID)
        if(user.length === 0){
            await ctx.reply(startText)
            await sendSetUsernameMessage(ctx)
        }else{
            sendFindPArtnerButton(ctx,startText)
        }
    }catch(err){
        console.log(err);
    }
}

async function setUsername(ctx:any):Promise<void>{
    try{
        const help:string = 'You can /skip or /stop current conversation'
        const userID:number = ctx.message.from.id
        const firstName:string = ctx.message.from.first_name;
        const lastName:string = ctx.message.from.last_name;
        const username:string = ctx.message.from.username;
        const text:string = ctx.message.text
        if(text === `Continue as ${firstName}`){
            const db = await connection
            const sql:string = 'INSERT INTO Users (ID,FirstName,LastName,Username,BotUSername,Date) VALUES(?,?,?,?,?,?)'
            db.query(sql,[userID,firstName,lastName,username,firstName,Date()])
            .then(sendFindPArtnerButton(ctx,help))
        }
        if(ctx.message.reply_to_message){
            const messageRepliedTo:string = ctx.message.reply_to_message.from.username
            const repliedText:string = ctx.message.reply_to_message.text
            const newUsername:string = ctx.message.text
            if(messageRepliedTo === 'zeus_chat_bot' && repliedText === 'Insert username'){
                const db = await connection
                const sql:string = 'INSERT INTO Users (ID,FirstName,LastName,Username,BotUSername,Date) VALUES(?,?,?,?,?,?)'
                db.query(sql,[userID,firstName,lastName,username,newUsername,Date()])
                .then(sendFindPArtnerButton(ctx,help))
            }
        }
        
    }catch(err){
        console.log(err);
    }
}

async function getUserByID(ID:number): Promise<User|[]>{
    const db = await connection
    const [user, rows] = await db.query('SELECT * FROM Users WHERE ID = ?',[ID])
    return user
}

async function findPartner(ctx:any): Promise<void>{
    const chats = await findSingleUsers()
    if(chats.length === 0){
        const db = await connection
        console.log(ctx.message.chat.id)
        
        // db.query('INSERT INTO Chat (ID,FirstUserID) VALUES (?,?)',[])
    }
}

async function findSingleUsers(): Promise<Chat|[]>{
    const db = await connection
    const [chats,rows] = db.query('SELECT * FROM Chat WHERE CancelledBy = null')
    return chats
}


const controller =  {
    startReply,
    sendInsertUsername,
    setUsername,
}

export{controller}