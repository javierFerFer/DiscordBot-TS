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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv_1 = require("dotenv");
const Music_1 = require("./Music");
const botCommands_json_1 = __importDefault(require("./botCommands.json"));
// Load enviroment variable to access token
dotenv_1.config();
const client = new discord_js_1.Client();
// token here
client.login(process.env.BOT_TOKEN);
client.on('ready', () => {
    console.log("Bot is ready!");
});
client.on('message', (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    if (message.content.startsWith(botCommands_json_1.default.playMusic)) {
        var youtubeURL = (_a = message.toString().split(botCommands_json_1.default.playMusic).pop()) === null || _a === void 0 ? void 0 : _a.trim();
        const connection = yield ((_c = (_b = message.member) === null || _b === void 0 ? void 0 : _b.voice.channel) === null || _c === void 0 ? void 0 : _c.join());
        var MusicController = new Music_1.Music(youtubeURL, connection);
    }
}));
