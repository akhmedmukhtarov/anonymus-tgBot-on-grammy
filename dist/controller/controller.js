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
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sendMessage = `Would yo like to change your username or continue as ${(_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.first_name}`;
            yield index_1.bot.api.sendMessage(ctx.message.chat.id, sendMessage, { reply_markup: {
                    force_reply: true,
                    keyboard: [[`Continue as ${(_b = ctx.message) === null || _b === void 0 ? void 0 : _b.from.first_name}`], ['Set new username']],
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
                keyboard: [[`Find a partner`], ['/Find adlakhf partner']],
            } });
    });
}
function sendInsertUsername(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            index_1.bot.api.sendMessage(ctx.message.chat.id, 'Insert username', {
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
            if (user.length === 0) {
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
function setUsername(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const help = 'You can /skip or /stop current conversation';
            const userID = ctx.message.from.id;
            const firstName = ctx.message.from.first_name;
            const lastName = ctx.message.from.last_name;
            const username = ctx.message.from.username;
            const text = ctx.message.text;
            if (text === `Continue as ${firstName}`) {
                const db = yield database_1.connection;
                const sql = 'INSERT INTO Users (ID,FirstName,LastName,Username,BotUSername,Date) VALUES(?,?,?,?,?,?)';
                db.query(sql, [userID, firstName, lastName, username, firstName, Date()])
                    .then(sendFindPArtnerButton(ctx, help));
            }
            if (ctx.message.reply_to_message) {
                const messageRepliedTo = ctx.message.reply_to_message.from.username;
                const repliedText = ctx.message.reply_to_message.text;
                const newUsername = ctx.message.text;
                if (messageRepliedTo === 'zeus_chat_bot' && repliedText === 'Insert username') {
                    const db = yield database_1.connection;
                    const sql = 'INSERT INTO Users (ID,FirstName,LastName,Username,BotUSername,Date) VALUES(?,?,?,?,?,?)';
                    db.query(sql, [userID, firstName, lastName, username, newUsername, Date()])
                        .then(sendFindPArtnerButton(ctx, help));
                }
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
        const [user, rows] = yield db.query('SELECT * FROM Users WHERE ID = ?', [ID]);
        return user;
    });
}
function findPartner(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const chats = yield findSingleUsers();
        if (chats.length === 0) {
            const db = yield database_1.connection;
            console.log(ctx.message.chat.id);
            // db.query('INSERT INTO Chat (ID,FirstUserID) VALUES (?,?)',[])
        }
    });
}
function findSingleUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = yield database_1.connection;
        const [chats, rows] = db.query('SELECT * FROM Chat WHERE CancelledBy = null');
        return chats;
    });
}
const controller = {
    startReply,
    sendInsertUsername,
    setUsername,
};
exports.controller = controller;
