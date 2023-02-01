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
exports.startReply = void 0;
function startReply(ctx) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const startText = `Hello there! I\'m your bot, to chat with other telegram users anonymusly`;
        ctx.reply(startText);
        console.log(ctx.message.chat);
        // bot.api.sendMessage(ctx.message.chat.id)
        ctx.reply(`Would yo like to change your username or continue as ${(_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.first_name}`);
    });
}
exports.startReply = startReply;
