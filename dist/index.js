"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bot = void 0;
const grammy_1 = require("grammy");
const controller_1 = require("./controller/controller");
const bot = new grammy_1.Bot('6198975010:AAHfeVMNB3siZMHyOBBqA59Jgq-ZOXgI_1k');
exports.bot = bot;
bot.command('start', controller_1.startReply);
bot.on("message", (ctx) => ctx.reply("Got another message!"));
bot.start();