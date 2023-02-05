"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.controller = void 0;
const index_1 = require("../index");
const database_1 = require("../database/database");
function sendSetUsernameMessage(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sendMessage = `Would yo like to change your username or continue with own username`;
            yield index_1.bot.api.sendMessage(ctx.message.chat.id, sendMessage, { reply_markup: {
                    force_reply: true,
                    keyboard: [[`Continue with own username`], ['Set new username']],
                    one_time_keyboard: true,
                } });
        }
        catch (err) {
            console.log(err);
        }
    });
}
function sendFindPArtnerButton(ctx, string) {
    return __awaiter(this, void 0, void 0, function* () {
        index_1.bot.api.sendMessage(ctx.message.chat.id, string, { reply_markup: {
                keyboard: [[`Find a partner`]],
            } });
    });
}
function sendInsertUsername(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            index_1.bot.api.sendMessage(ctx.message.chat.id, 'Insert username with hashtag like #example', {
                reply_markup: {
                    force_reply: true,
                    input_field_placeholder: 'Insert new username'
                }
            });
        }
        catch (err) {
            console.log(err);
        }
    });
}
function startReply(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const startText = `Hello there! I\'m your bot, to chat with other telegram users anonymusly`;
            const UserID = ctx.message.from.id;
            const user = yield getUserByID(UserID);
            if (!user) {
                yield ctx.reply(startText);
                yield sendSetUsernameMessage(ctx);
            }
            else {
                sendFindPArtnerButton(ctx, startText);
            }
        }
        catch (err) {
            console.log(err);
        }
    });
}
function getUserByID(ID) {
    return __awaiter(this, void 0, void 0, function* () {
        const db = yield database_1.connection;
        const [[user], rows] = yield db.query('SELECT * FROM Users WHERE ID = ?', [ID]);
        return user;
    });
}
function findPartner(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const ID = ctx.message.from.id;
            const db = yield database_1.connection;
            ctx.reply('Looking for a partner');
            const chats = yield findSingleUsers();
            if (chats.length === 0) {
                db.query('INSERT INTO Chat (FirstUserID) VALUES (?)', [ctx.message.from.id]);
            }
            else if (chats.length > 0 && chats[0].SecondUSerID !== 0 && chats[0].FirstUserID !== 0) {
                yield db.query('UPDATE Chat SET SecondUserID = ?, Date = ? WHERE FirstUserID = ?', [ID, Date(), chats[0]['FirstUserID']]);
                const firstUser = yield getUserByID(chats[0]['FirstUserID']);
                const secondUser = yield getUserByID(ID);
                ctx.reply(`Chat started with ${firstUser.BotUsername}`);
                ctx.api.sendMessage(firstUser.ID, `Chat started with ${secondUser.BotUsername}`);
            }
        }
        catch (err) {
            console.log(err);
        }
    });
}
function findSingleUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = yield database_1.connection;
        const [chats, rows] = yield db.query('SELECT * FROM Chat WHERE SecondUserID IS NULL');
        return chats;
    });
}
function continueWithOwnUsername(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const { userID, firstName, lastName, username } = ctx.message.from;
        const db = yield database_1.connection;
        const user = yield getUserByID(userID);
        if (!user) {
            const sql = 'INSERT INTO Users (ID,FirstName,LastName,Username,BotUSername,Date) VALUES(?,?,?,?,?,?)';
            db.query(sql, [userID, firstName, lastName, username, firstName, Date()]);
        }
        else {
            const insertToHistorySql = 'INSERT INTO UsernameHistory (UserID,OldBotUsername,NewBotUsername,Date) VALUES (?,?,?,?)';
            db.query(insertToHistorySql, [userID, user.BotUsername, firstName, Date()]);
            const updateUsernameSql = 'UPDATE Users SET BotUsername = ? WHERE ID = ?';
            db.query(updateUsernameSql, [firstName, userID]);
        }
    });
}
function setUsername(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userID, firstName, lastName, username } = ctx.message.from;
            if (ctx.message.reply_to_message) {
                const messageRepliedTo = ctx.message.reply_to_message.from.username;
                const repliedText = ctx.message.reply_to_message.text;
                const newUsername = ctx.message.text.substring(1);
                if (messageRepliedTo === 'zeus_chat_bot' && repliedText === 'Insert username with hashtag like #example') {
                    const db = yield database_1.connection;
                    const user = yield getUserByID(userID);
                    if (!user) {
                        const sql = 'INSERT INTO Users (ID,FirstName,LastName,Username,BotUSername,Date) VALUES(?,?,?,?,?,?)';
                        db.query(sql, [userID, firstName, lastName, username, newUsername, Date()]);
                    }
                    else {
                        const insertToHistorySql = 'INSERT INTO UsernameHistory (UserID,OldBotUsername,NewBotUsername,Date) VALUES (?,?,?,?)';
                        db.query(insertToHistorySql, [userID, user.BotUsername, newUsername, Date()]);
                        const updateUsernameSql = 'UPDATE Users SET BotUsername = ? WHERE ID = ?';
                        db.query(updateUsernameSql, [newUsername, userID]);
                    }
                }
            }
        }
        catch (err) {
            console.log(err);
        }
    });
}
function chatRoom(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const messageFromID = ctx.message.from.id;
            const chat = yield getChatroom(messageFromID);
            if (chat) {
                if (chat.FirstUserID === messageFromID) {
                    ctx.api.sendMessage(chat.SecondUserID, `${ctx.message.text}`);
                }
                else if (chat.SecondUserID === messageFromID) {
                    ctx.api.sendMessage(chat.FirstUserID, `${ctx.message.text}`);
                }
            }
            else {
                ctx.reply('You have no chat companion');
            }
        }
        catch (err) {
            console.log(err);
        }
    });
}
function getChatroom(ID) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const db = yield database_1.connection;
            const sql = 'SELECT * FROM Chat WHERE (FirstUserID = ? OR SecondUserID = ?) AND CancelledBy IS NULL';
            const [[chat], rows] = yield db.query(sql, [ID, ID]);
            return chat;
        }
        catch (err) {
            console.log(err);
        }
    });
}
const controller = {
    getChatroom,
    sendSetUsernameMessage,
    chatRoom,
    continueWithOwnUsername,
    findPartner,
    startReply,
    sendInsertUsername,
    setUsername,
};
exports.controller = controller;
