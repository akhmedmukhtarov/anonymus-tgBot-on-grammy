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

type Chat = [{
    ID: number,
    FirstUserID: number,
    SecondUSerID: number,
    Date: string,
    CancelledBy: null|string
}]

type ChatRoom = {
    ID: number,
    FirstUserID:number,
    SecondUserID: number|null,
    Date: string|null,
    CancelledBy: string|null
}


async function sendSetUsernameMessage(ctx:any): Promise<void> {
    try{
        const sendMessage:string = `Would yo like to change your username or continue with own username`
        await bot.api.sendMessage(ctx.message.chat.id,sendMessage,{reply_markup:{
            force_reply: true,
            keyboard: [[`Continue with own username`],['Set new username']],
            one_time_keyboard: true,
        }})
    }catch(err){
        console.log(err);
    }
}

async function sendFindPArtnerButton(ctx:any ,string:string): Promise<void>{
    bot.api.sendMessage(ctx.message.chat.id,string,{reply_markup:{
        keyboard: [[`Find a partner`]],
    }})
}

async function sendInsertUsername(ctx:any): Promise<void>{
    try{
        bot.api.sendMessage(ctx.message.chat.id, 'Insert username with hashtag like #example',{
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
        if(!user){
            await ctx.reply(startText)
            await sendSetUsernameMessage(ctx)
        }else{
            sendFindPArtnerButton(ctx,startText)
        }
    }catch(err){
        console.log(err);
    }
}

async function getUserByID(ID:number): Promise<User>{
    const db = await connection
    const [[user], rows] = await db.query('SELECT * FROM Users WHERE ID = ?',[ID])
    return user
}

async function findPartner(ctx:any): Promise<void>{
    try{
        const ID:number = ctx.message.from.id
        const db = await connection
        ctx.reply('Looking for a partner')
        const chats = await findSingleUsers()
        if(chats.length === 0){
            db.query('INSERT INTO Chat (FirstUserID) VALUES (?)',[ctx.message.from.id])
        }else if (chats.length > 0 && chats[0].SecondUSerID !== 0 && chats[0].FirstUserID !== 0){
            await db.query('UPDATE Chat SET SecondUserID = ?, Date = ? WHERE FirstUserID = ?',[ID,Date(),chats[0]['FirstUserID']])
            const firstUser = await getUserByID(chats[0]['FirstUserID'])
            const secondUser = await getUserByID(ID)
            ctx.reply(`Chat started with ${firstUser.BotUsername}`)
            ctx.api.sendMessage(firstUser.ID,`Chat started with ${secondUser.BotUsername}`)  
        }
    }catch(err){
        console.log(err);
    }
}

async function findSingleUsers(): Promise<Chat|[]>{
    const db = await connection
    const [chats,rows] = await db.query('SELECT * FROM Chat WHERE SecondUserID IS NULL')
    return chats
}

async function continueWithOwnUsername(ctx:any): Promise<void>{
    type info = {userID:number,firstName:string,lastName:string, username:string,}
    const {userID,firstName,lastName,username}: info = ctx.message.from
    const db = await connection
    const user = await getUserByID(userID)
    if(!user){
        const sql:string = 'INSERT INTO Users (ID,FirstName,LastName,Username,BotUSername,Date) VALUES(?,?,?,?,?,?)'
        db.query(sql,[userID,firstName,lastName,username,firstName,Date()])
    }else{
        const insertToHistorySql:string = 'INSERT INTO UsernameHistory (UserID,OldBotUsername,NewBotUsername,Date) VALUES (?,?,?,?)'
        db.query(insertToHistorySql,[userID,user.BotUsername,firstName,Date()])
        const updateUsernameSql:string = 'UPDATE Users SET BotUsername = ? WHERE ID = ?'
        db.query(updateUsernameSql,[firstName,userID])
    }
}

async function setUsername(ctx:any): Promise<void>{
    try{
        type info = {userID:number,firstName:string,lastName:string, username:string}
        const {userID,firstName,lastName,username}: info = ctx.message.from
        if(ctx.message.reply_to_message){
            const messageRepliedTo:string = ctx.message.reply_to_message.from.username
            const repliedText:string = ctx.message.reply_to_message.text
            const newUsername:string = ctx.message.text.substring(1)
            if(messageRepliedTo === 'zeus_chat_bot' && repliedText === 'Insert username with hashtag like #example'){
                const db = await connection
                const user = await getUserByID(userID)
                if(!user){
                    const sql:string = 'INSERT INTO Users (ID,FirstName,LastName,Username,BotUSername,Date) VALUES(?,?,?,?,?,?)'
                    db.query(sql,[userID,firstName,lastName,username,newUsername,Date()])
                }else{
                    const insertToHistorySql:string = 'INSERT INTO UsernameHistory (UserID,OldBotUsername,NewBotUsername,Date) VALUES (?,?,?,?)'
                    db.query(insertToHistorySql,[userID,user.BotUsername,newUsername,Date()])
                    const updateUsernameSql:string = 'UPDATE Users SET BotUsername = ? WHERE ID = ?'
                    db.query(updateUsernameSql,[newUsername,userID])
                }
            }
        }

    }catch(err){
        console.log(err);
    }
}

async function chatRoom(ctx:any): Promise<void>{
    try{
        const messageFromID:number = ctx.message.from.id
        const chat = await getChatroom(messageFromID)
        if(chat){
            if(chat.FirstUserID === messageFromID){
                ctx.api.sendMessage(chat.SecondUserID,`${ctx.message.text}`)
            }else if(chat.SecondUserID === messageFromID){
                ctx.api.sendMessage(chat.FirstUserID,`${ctx.message.text}`)
            }
        }else{
            ctx.reply('You have no chat companion')

        }
    }catch(err){
        console.log(err);
    }
    
    
}

async function getChatroom(ID:number): Promise<ChatRoom|undefined>{
    try{
        const db = await connection
        const sql:string= 'SELECT * FROM Chat WHERE (FirstUserID = ? OR SecondUserID = ?) AND CancelledBy IS NULL'
        const [[chat],rows] = await db.query(sql,[ID,ID])
        return chat
    }catch(err){
        console.log(err);
    }
}

const controller =  {
    getChatroom,
    sendSetUsernameMessage,
    chatRoom,
    continueWithOwnUsername,
    findPartner,
    startReply,
    sendInsertUsername,
    setUsername,
}

export{controller}