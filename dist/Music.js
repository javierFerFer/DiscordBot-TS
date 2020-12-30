"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Music = void 0;
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const config_json_1 = __importDefault(require("./config.json"));
const playList = require('youtube-playlist-summary');
class Music {
    constructor(ytURLParam, connectionParam) {
        this.ytURL = ytURLParam;
        this.connection = connectionParam;
        this.counterYtList = 0;
        this.playListMap = new Map();
        this.processURL();
    }
    processURL() {
        var _a;
        if (this.ytURL.includes(config_json_1.default.playList)) {
            const PLAY_LIST_ID = (_a = this.ytURL.toString().split(config_json_1.default.http).pop()) === null || _a === void 0 ? void 0 : _a.trim();
            const config = {
                GOOGLE_API_KEY: process.env.YT_TOKEN,
                PLAYLIST_ITEM_KEY: ['publishedAt', 'title', 'description', 'videoId', 'videoUrl'],
            };
            const ps = new playList(config);
            ps.getPlaylistItems(PLAY_LIST_ID)
                .then((result) => {
                for (let i = 0; i < result.items.length; i++) {
                    var videoInfo = result.items[i];
                    this.playListMap.set(videoInfo.title, videoInfo.videoUrl);
                }
                if (this.playListMap.size != 0) {
                    this.playList(this.counterYtList);
                }
                else {
                    // Error mensaje playList empty
                }
            });
        }
        else {
            this.playSingleSong();
        }
    }
    playSingleSong() {
        this.connection.play(ytdl_core_1.default(this.ytURL, { filter: 'audioonly' }));
        // Show actual song
    }
    playList(counter) {
        var videoName = Array.from(this.playListMap.keys())[counter];
        var url = this.playListMap.get(videoName);
        // Show list of songs
        this.playSongWithUrl(url);
    }
    playSongWithUrl(url) {
        this.connection.play(ytdl_core_1.default(url, { filter: 'audioonly' }));
        // Show actual Song
        this.connection.dispatcher.on('finish', () => {
            this.counterYtList += 1;
            if (this.counterYtList < this.playListMap.size) {
                this.playList(this.counterYtList);
            }
            else {
                // PlayList finished
            }
        });
    }
}
exports.Music = Music;
