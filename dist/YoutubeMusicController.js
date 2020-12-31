"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YoutubeMusicController = void 0;
const discord_js_1 = require("discord.js");
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const config_json_1 = __importDefault(require("./config.json"));
const errorMessages_json_1 = __importDefault(require("./errorMessages.json"));
const PLAYLIST = require('youtube-playlist-summary');
const discordChangeTextElements_json_1 = __importDefault(require("./discordChangeTextElements.json"));
const GET_YOUTUBLE_TITLE_VIDEO = require('get-youtube-title');
class YoutubeMusicController {
    constructor(ytURLParam, connectionParam, messageParam) {
        this.ytURL = ytURLParam;
        this.connection = connectionParam;
        this.counterYtList = 0;
        this.message = messageParam;
        this.playListTitleUrl = new Map();
        this.processURL();
    }
    processURL() {
        var _a;
        try {
            if (this.ytURL.includes(config_json_1.default.playList)) {
                const PLAY_LIST_ID = (_a = this.ytURL.toString().split(config_json_1.default.httpPlayList).pop()) === null || _a === void 0 ? void 0 : _a.trim();
                const CONFIG = {
                    GOOGLE_API_KEY: process.env.YT_TOKEN,
                    PLAYLIST_ITEM_KEY: ['publishedAt', 'title', 'description', 'videoId', 'videoUrl'],
                };
                const PS = new PLAYLIST(CONFIG);
                PS.getPlaylistItems(PLAY_LIST_ID)
                    .then((result) => {
                    for (let i = 0; i < result.items.length; i++) {
                        var videoInfo = result.items[i];
                        this.playListTitleUrl.set(videoInfo.title, videoInfo.videoUrl);
                    }
                    if (this.playListTitleUrl.size != 0) {
                        this.showPlayList();
                        this.playList(this.counterYtList);
                    }
                    else {
                        // Error mensaje playList empty
                        this.message.channel.send(errorMessages_json_1.default.PlayListEmptyError);
                    }
                })
                    .catch((error) => {
                    this.message.channel.send(errorMessages_json_1.default.noProcessUrlMusic);
                });
            }
            else {
                this.playSingleSong();
            }
        }
        catch (error) {
            this.message.channel.send(errorMessages_json_1.default.noProcessUrlMusic);
        }
    }
    showPlayList() {
        var titleList = discordChangeTextElements_json_1.default.list;
        for (var [key, value] of this.playListTitleUrl) {
            titleList += discordChangeTextElements_json_1.default.pointList + key + "\n";
        }
        titleList += discordChangeTextElements_json_1.default.list;
        this.showMessageEmbebed(discordChangeTextElements_json_1.default.ListMusicYT, 0xff0000, titleList);
    }
    showMessageEmbebed(titleParam, colorParam, descriptionParam) {
        const embed = new discord_js_1.MessageEmbed()
            // Set the title of the field
            .setTitle(discordChangeTextElements_json_1.default.bold + titleParam + discordChangeTextElements_json_1.default.bold)
            // Set the color of the embed
            .setColor(colorParam)
            // Set the main content of the embed
            .setDescription(discordChangeTextElements_json_1.default.boldCursive + descriptionParam + discordChangeTextElements_json_1.default.boldCursive);
        // Send the embed to the same channel as the message
        this.message.channel.send(embed);
    }
    playSingleSong() {
        this.connection.play(ytdl_core_1.default(this.ytURL, { filter: 'audioonly' }));
        // Show actual song
        this.showTitleSongWithURL();
    }
    showTitleSongWithURL() {
        var _a;
        const PLAY_LIST_ID = (_a = this.ytURL.toString().split(config_json_1.default.httpPlaySingleSong).pop()) === null || _a === void 0 ? void 0 : _a.trim();
        var title;
        var tempMessage = this.message;
        GET_YOUTUBLE_TITLE_VIDEO(PLAY_LIST_ID, function (error, title) {
            const embed = new discord_js_1.MessageEmbed()
                // Set the title of the field
                .setTitle(discordChangeTextElements_json_1.default.bold + discordChangeTextElements_json_1.default.musicNow + discordChangeTextElements_json_1.default.bold)
                // Set the color of the embed
                .setColor(0xff0000)
                // Set the main content of the embed
                .setDescription(discordChangeTextElements_json_1.default.boldCursive + title + discordChangeTextElements_json_1.default.boldCursive);
            // Send the embed to the same channel as the message
            tempMessage.channel.send(embed);
        });
    }
    playList(counter) {
        var videoName = Array.from(this.playListTitleUrl.keys())[counter];
        this.showMessageEmbebed(discordChangeTextElements_json_1.default.musicNow, 0xff0000, videoName);
        var url = this.playListTitleUrl.get(videoName);
        this.playSongWithUrl(url);
    }
    playSongWithUrl(url) {
        this.connection.play(ytdl_core_1.default(url, { filter: 'audioonly' }));
        // Show actual Song
        this.connection.dispatcher.on('finish', () => {
            this.counterYtList += 1;
            if (this.counterYtList < this.playListTitleUrl.size) {
                this.playList(this.counterYtList);
            }
            else {
                // PlayList finished
            }
        });
    }
}
exports.YoutubeMusicController = YoutubeMusicController;
