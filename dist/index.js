"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bot = void 0;
const grammy_1 = require("grammy");
const controller_1 = require("./controller/controller");
const bot = new grammy_1.Bot('6198975010:AAHfeVMNB3siZMHyOBBqA59Jgq-ZOXgI_1k');
exports.bot = bot;
bot.command('start', controller_1.controller.startReply);
bot.command('newusername', controller_1.controller.sendInsertUsername);
bot.hears('Set new username', controller_1.controller.sendInsertUsername);
bot.hears('FIND A PARTNER');
bot.on('message', controller_1.controller.setUsername);
bot.start();
