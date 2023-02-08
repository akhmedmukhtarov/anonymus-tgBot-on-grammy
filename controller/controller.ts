import {bot} from '../index'
import {connection} from '../database/database'
import { InlineKeyboard, Context } from 'grammy'

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


async function sendSetUsernameMessage(ctx:Context): Promise<void> {
    try{
        const sendMessage:string = `🤖 -Yangi ism tanlaysizmi, yoki "${ctx?.from?.first_name || 0}" deb davom ettirasizmi?`
        await bot.api.sendMessage(ctx?.message?.chat?.id || 0,sendMessage,{reply_markup:{
            force_reply: true,
            keyboard: [[`O'z ismimda qolaman🤵‍♂️`],['Yangi ism tanlayman🥷']],
            one_time_keyboard: true,
            resize_keyboard: true
        }})
    }catch(err){
        console.log(err);
    }
}

async function sendFindPArtnerButton(id:number ,string:string): Promise<void>{
    bot.api.sendMessage(id,string,{reply_markup:{
        keyboard: [[`Suhbatdosh izlash🔍`]],
        one_time_keyboard: true,
        resize_keyboard: true
    }})
}

async function sendInsertUsername(ctx:any): Promise<void>{
    try{
        bot.api.sendMessage(ctx.message.chat.id, '🤖 -Yangi ismni heshteg bilan kiriting #Namuna',{
            reply_markup:{
                force_reply: true,
                input_field_placeholder: '#Matkarim'
            }
        })
    }catch(err){
        console.log(err);
        
    }
}

async function startReply(ctx:any): Promise<void>{
    try{
        const startText: string = `🤖 -Hayrli kun, mening ismim Zevs. Men boshqa telegram foydalanuvchilari bilan anonim tarzda muloqot qilishda vositachi bo'lib xizmat ko'rsataman`
        const UserID:number = ctx.message.from.id
        const user = await getUserByID(UserID)
        if(!user){
            await ctx.reply(startText)
            await sendSetUsernameMessage(ctx)
        }else{
            await ctx.reply('', {})
            sendFindPArtnerButton(ctx.chat.id,startText)
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
        const user = await getUserByID(ID)
        if(user){
            const db = await connection
            ctx.reply('🤖 -Suhbatdosh izlayapman👀...')
            const chats = await findSingleUsers()
            if(chats.length === 0){
                db.query('INSERT INTO Chat (FirstUserID) VALUES (?)',[ctx.message.from.id])
            }else if (chats.length > 0 && chats[0].FirstUserID !== ID){
                const sql = 'SELECT * FROM BlockedUsers WHERE (UserID = ? OR UserID = ?) AND (BlockedUserID = ? OR BlockedUserID = ?)'
                const [[res],rows] = await db.query(sql, [user.ID,chats[0].FirstUserID,user.ID,chats[0].FirstUserID])
                if(!res){
                    await db.query('UPDATE Chat SET SecondUserID = ?, Date = ? WHERE FirstUserID = ?',[ID,Date(),chats[0]['FirstUserID']])
                    const firstUser = await getUserByID(chats[0]['FirstUserID'])
                    const secondUser = await getUserByID(ID)
                    ctx.reply(`🤖 Marhamat, tanishing bot foydalanuvchisi "${firstUser.BotUsername}"`)
                    ctx.api.sendMessage(firstUser.ID,`🤖 Marhamat, tanishing bot foydalanuvchisi "${secondUser.BotUsername}"`)
                }  
            }
        }else{
            ctx.reply('🤖 -Ismingizni kiritish esingizdan chiqmadimi?')
            sendSetUsernameMessage(ctx)
        }
    }catch(err){
        console.log(err);
    }
}

async function findSingleUsers(): Promise<Chat|[]>{
    const db = await connection
    const [chats,rows] = await db.query('SELECT * FROM Chat WHERE SecondUserID IS NULL AND CancelledBy IS NULL')
    return chats
}

async function continueWithOwnUsername(ctx:any): Promise<void>{
    try{
        type info = {id:number,first_name:string,last_name:string, username:string,}
        const {id,first_name,last_name,username}: info = ctx.message.from
        const db = await connection
        const user = await getUserByID(id)
        if(!user){
            const sql:string = 'INSERT INTO Users (ID,FirstName,Username,BotUsername,Date) VALUES (?,?,?,?,?)'
            await db.query(sql,[id,first_name,username,first_name,Date()])
            sendFindPArtnerButton(id,`🤖 -Bemalol suhbatdosh topishingiz mumkin`)
        }else{
            const insertToHistorySql:string = 'INSERT INTO UsernameHistory (UserID,OldBotUsername,NewBotUsername,Date) VALUES (?,?,?,?)'
            await db.query(insertToHistorySql,[id,user.BotUsername,first_name,Date()])
            const updateUsernameSql:string = 'UPDATE Users SET BotUsername = ? WHERE ID = ?'
            await db.query(updateUsernameSql,[first_name,id])
            sendFindPArtnerButton(id,`🤖 -Bemalol suhbatdosh topishingiz mumkin`)

        }
    }catch(err){
        ctx.reply('🤖 - XATOLIK:(    Siz ro\'yhattan o\'ta olmadingiz. Iltimos keyinroq urinib ko\'ring')
        console.log(err);
    }
}

async function setUsername(ctx:any): Promise<void>{
    try{
        type info = {id:number,first_name:string,last_name:string, username:string}
        const {id,first_name,last_name,username}: info = ctx.message.from
        if(ctx.message.reply_to_message){
            const messageRepliedTo:string = ctx.message.reply_to_message.from.username
            const repliedText:string = ctx.message.reply_to_message.text
            const newUsername:string = ctx.message.text.substring(1)
            if(messageRepliedTo === 'zeus_chat_bot' && repliedText === '🤖 -Yangi ismni heshteg bilan kiriting #Namuna'){
                const db = await connection
                const user = await getUserByID(id)
                if(!user){
                    const sql:string = 'INSERT INTO Users (ID,FirstName,Username,BotUSername,Date) VALUES(?,?,?,?,?)'
                    await db.query(sql,[id,first_name,username,newUsername,Date()])
                }else{
                    const insertToHistorySql:string = 'INSERT INTO UsernameHistory (UserID,OldBotUsername,NewBotUsername,Date) VALUES (?,?,?,?)'
                    await db.query(insertToHistorySql,[id,user.BotUsername,newUsername,Date()])
                    const updateUsernameSql:string = 'UPDATE Users SET BotUsername = ? WHERE ID = ?'
                    await db.query(updateUsernameSql,[newUsername,id])
                }
            }
            sendFindPArtnerButton(ctx.chat.id, `🤖 -Bemalol suhbatdosh topishingiz mumkin`)
        }

    }catch(err){
        ctx.reply('🤖 - XATOLIK:(    Siz ro\'yhattan o\'ta olmadingiz. Iltimos keyinroq urinib ko\'ring')
        console.log(err);
    }
}

async function chatRoom(ctx:any): Promise<void>{
    try{
        const ID:number = ctx.message.from.id
        const chat = await getChatroom(ID)
        if(chat){
            if(chat.FirstUserID === ID){
                saveMessageStory(ctx,chat.ID)
                ctx.api.sendMessage(chat.SecondUserID,`${ctx.message.text}`)
            }else if(chat.SecondUserID === ID){
                saveMessageStory(ctx,chat.ID)
                ctx.api.sendMessage(chat.FirstUserID,`${ctx.message.text}`)
            }
        }else{
            sendFindPArtnerButton(ctx.chat.id,'🤖 -Yaxshi tushunmadim... Balki suhbatdosh tushunar⁉️')
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

async function saveMessageStory(ctx:any,chatID:number): Promise<void>{
    try{
        const db = await connection
        const text: string = ctx.message.text
        const id: number = ctx.message.from.id
        db.query('INSERT INTO ChatHistory (ChatID,UserID,Text,Date) VALUES (?,?,?,?)',[chatID,id,text,Date()])
    }catch(err){
        console.log(err);
    }
}

async function stopConversation(ctx:any): Promise<void>{
    try{
        const chat = await getChatroom(ctx.message.from.id)
        if(chat){
            let partnerID: number|null
            chat.FirstUserID === ctx.chat.id ? partnerID = chat.SecondUserID : partnerID = chat.FirstUserID
            if(partnerID){
                const partner = await getUserByID(partnerID)
                const user = await getUserByID(ctx.chat.id)
                bot.api.sendMessage(ctx.message.from.id, `🤖 -'${partner.BotUsername}' haqidagi ta\'surotingiz, menga keyingi safar siz uchun yaxshiroq foydalanuvchilarni topishda yordam beradi`, {
                    reply_markup: {
                        inline_keyboard:[
                            [
                                {text: '👍', callback_data: 'good'},
                                {text:'👎', callback_data: 'bad'}
                            ],
                            [
                                {text:'Shikoyat qoldirish📖🖌️', callback_data: 'report'}
                            ],
                            [
                                {text: 'Bloklash⛔️', callback_data: `${partnerID}`}
                            ]
                        ]
                    }
                })
                bot.api.sendMessage(partnerID, `🤖 -'${user.BotUsername}' haqidagi ta\'surotingiz, menga keyingi safar siz uchun yaxshiroq foydalanuvchilarni topishda yordam beradi`, {
                    reply_markup: {
                        inline_keyboard:[
                            [
                                {text: '👍', callback_data: 'good'},
                                {text:'👎', callback_data: 'bad'}
                            ],
                            [
                                {text:'Shikoyat qoldirish📖🖌️', callback_data: 'report'}
                            ],
                            [
                                {text: 'Bloklash⛔️', callback_data: `${partnerID}`}
                            ]
                        ]
                    }
                })
                sendFindPArtnerButton(ctx.chat.id , '🤖 -Muloqot to\'xtatildi')
                sendFindPArtnerButton(partnerID,`🤖 -Foydalanuvchi ${user.BotUsername} muloqotni to\'xtatdi`)
                const db = await connection
                db.query('UPDATE Chat SET CancelledBy = ? WHERE ID = ? ',[ctx.chat.id, chat.ID])
            }else{
                sendFindPArtnerButton(ctx.chat.id , '🤖 -Qidiruv to\'xtatildi')
                const db = await connection
                db.query('UPDATE Chat SET CancelledBy = ? WHERE ID = ? ',[ctx.chat.id, chat.ID])
            }
        }else{
            ctx.reply('🤖 -Siz hech kim bilan suhbat boshlaganigiz yo\'q')
        }
    }catch(err){
        console.log(err);
    }
}

async function callbackHandler(query:any): Promise<void>{
    try{
        const data = query.update.callback_query.data
        const callbackID = query.update.callback_query.id
        const userID:number = query.update.callback_query.from.id
        const report = ['good','bad','vulgar','ad','thread','agitation']
        if(report.includes(data)){
            bot.api.answerCallbackQuery(callbackID, {text: 'Javob uchun rahmat!', show_alert: true});
        }else if(data === 'report'){
            sendReportVariation(userID)
        }else{
            const db = await connection 
            db.query('INSERT INTO BlockedUsers (UserID,BlockedUserID) VALUES(?,?)',[userID,data])
            bot.api.answerCallbackQuery(callbackID, {text: 'Bloklandi', show_alert: true});
        }
    }catch(err){
        console.log(err);
    }
}

async function sendReportVariation(id:number): Promise<void>{
    bot.api.sendMessage(id, `🤖 -Shikoyatingiz nima haqida?`, {
        reply_markup: {
            inline_keyboard:[
                [
                    {text: 'Reklama💸', callback_data: 'ad'},
                ],
                [
                    {text:'Vulgar🔞', callback_data: 'vulgar'}
                ],
                [
                    {text: 'Tahdid🫵', callback_data: `thread`}
                ],
                [
                    {text: 'Propaganda🐑', callback_data: `agitation`}
                ]
            ]
        }
    })
}

async function sendRules(ctx:any): Promise<void>{
    const str: string = "Chatda har qanday ideya targ\'ib qilish, mahsulot yoki hizmat reklamasi bilan shug'ullanish,tahdid qilish va shaxsiy ma\'lumotlar almashish taqiqlanadi."
    ctx.api.sendMessage(ctx.chat.id, str)
}

async function skip(ctx:any): Promise<void>{
    try{
        const chat = await getChatroom(ctx.message.from.id)
        if(chat){
            let partnerID: number|null
            chat.FirstUserID === ctx.chat.id ? partnerID = chat.SecondUserID : partnerID = chat.FirstUserID
            if(partnerID){
                const partner = await getUserByID(partnerID)
                const user = await getUserByID(ctx.chat.id)
                bot.api.sendMessage(ctx.message.from.id, `🤖 -'${partner.BotUsername}' haqidagi ta\'surotingiz, menga keyingi safar siz uchun yaxshiroq foydalanuvchilarni topishda yordam beradi`, {
                    reply_markup: {
                        inline_keyboard:[
                            [
                                {text: '👍', callback_data: 'good'},
                                {text:'👎', callback_data: 'bad'}
                            ],
                            [
                                {text:'Shikoyat qoldirish📖🖌️', callback_data: 'report'}
                            ],
                            [
                                {text: 'Bloklash⛔️', callback_data: `${partnerID}`}
                            ]
                        ]
                    }
                })
                bot.api.sendMessage(partnerID, `🤖 -'${user.BotUsername}' haqidagi ta\'surotingiz, menga keyingi safar siz uchun yaxshiroq foydalanuvchilarni topishda yordam beradi`, {
                    reply_markup: {
                        inline_keyboard:[
                            [
                                {text: '👍', callback_data: 'good'},
                                {text:'👎', callback_data: 'bad'}
                            ],
                            [
                                {text:'Shikoyat qoldirish📖🖌️', callback_data: 'report'}
                            ],
                            [
                                {text: 'Bloklash⛔️', callback_data: `${partnerID}`}
                            ]
                        ]
                    }
                })
                sendFindPArtnerButton(partnerID,`🤖 -Foydalanuvchi ${user.BotUsername} muloqotni to\'xtatdi`)
                const db = await connection
                db.query('UPDATE Chat SET CancelledBy = ? WHERE ID = ? ',[ctx.chat.id, chat.ID])
                findPartner(ctx)
            }else{
                const db = await connection
                db.query('UPDATE Chat SET CancelledBy = ? WHERE ID = ? ',[ctx.chat.id, chat.ID])
            }
        }else{
            ctx.reply('🤖 -Siz hech kim bilan suhbat boshlaganigiz yo\'q')
        }

    }catch(err){
        console.log(err);
    }
}

const controller =  {
    skip,
    sendRules,
    callbackHandler,
    stopConversation,
    sendSetUsernameMessage,
    chatRoom,
    continueWithOwnUsername,
    findPartner,
    startReply,
    sendInsertUsername,
    setUsername,
}

export{controller}