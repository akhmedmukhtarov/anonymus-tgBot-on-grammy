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
        const sendMessage = `Would yo like to change your username or continue as ${(_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.first_name}`;
        yield index_1.bot.api.sendMessage(ctx.message.chat.id, sendMessage, { reply_markup: {
                force_reply: true,
                keyboard: [[`Continue as **${(_b = ctx.message) === null || _b === void 0 ? void 0 : _b.from.first_name}**`], ['/newusername']],
                one_time_keyboard: true,
            } });
    });
}
function startReply(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const startText = `Hello there! I\'m your bot, to chat with other telegram users anonymusly`;
            yield ctx.reply(startText);
            sendSetUsernameMessage(ctx);
        }
        catch (err) {
            console.log(err);
        }
    });
}
function insertUsername(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        index_1.bot.api.sendMessage(ctx.message.chat.id, 'Insert username', {
            reply_markup: {
                force_reply: true,
                input_field_placeholder: 'Insert new username'
            }
        });
    });
}
function setUsername(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userID = ctx.message.from.id;
            const firstName = ctx.message.from.first_name;
            const lastName = ctx.message.from.last_name;
            const username = ctx.message.from.username;
            const text = ctx.message.text;
            if (text === `Continue as **${firstName}**`) {
                const db = yield database_1.connection;
                const sql = 'INSERT INTO Users (ID,FirstName,LastName,Username,BotUSername,Date) VALUES(?,?,?,?,?,?)';
                db.query(sql, [userID, firstName, lastName, username, firstName, Date()]);
            }
            if (ctx.message.reply_to_message) {
                const messageRepliedTo = ctx.message.reply_to_message.username;
                const repliedText = ctx.message.reply_to_message.text;
                console.log(messageRepliedTo, repliedText);
                console.log(ctx.message.reply_to_message);
            }
        }
        catch (err) {
            console.log(err);
        }
    });
}
const controller = {
    startReply,
    insertUsername,
    setUsername,
};
exports.controller = controller;
