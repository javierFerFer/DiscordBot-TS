import { VoiceConnection } from "discord.js";
import ytdl from "ytdl-core";
import urlElements from './config.json';
const playList = require('youtube-playlist-summary');
export class Music {

    ytURL: string;
    counterYtList: any;
    connection: VoiceConnection;
    playListMap: Map<string, string>;

    constructor(ytURLParam: string, connectionParam: VoiceConnection) {
        this.ytURL = ytURLParam;
        this.connection = connectionParam;
        this.counterYtList = 0;

        this.playListMap = new Map();

        this.processURL();
    }

    processURL(){
        if (this.ytURL.includes(urlElements.playList)) {

            const PLAY_LIST_ID: string = this.ytURL.toString().split(urlElements.http).pop()?.trim()!;
            
            const config = {
                GOOGLE_API_KEY: process.env.YT_TOKEN, // require
                PLAYLIST_ITEM_KEY: ['publishedAt', 'title', 'description', 'videoId', 'videoUrl'], // option
              }

            const ps = new playList(config)
         
            ps.getPlaylistItems(PLAY_LIST_ID)
            .then((result: any) => {

            for (let i = 0; i < result.items.length; i++) {
                var videoInfo = result.items[i];
                this.playListMap.set(videoInfo.title, videoInfo.videoUrl);
            }

            if (this.playListMap.size != 0) {
               this.playList(this.counterYtList);
            } else {
                // Error mensaje playList empty
            }

          })

        } else {
            this.playSingleSong();
        }
    }

    playSingleSong(){
        this.connection.play(ytdl(this.ytURL, {filter: 'audioonly'}));
        // Show actual song
    }

    playList(counter: any){
        var videoName = Array.from(this.playListMap.keys())[counter];
        var url: string = this.playListMap.get(videoName)!;

        // Show list of songs

        this.playSongWithUrl(url);
    }

    playSongWithUrl(url: string){
        this.connection.play(ytdl(url, {filter: 'audioonly'}));

        // Show actual Song

        this.connection.dispatcher.on('finish', () => {
            this.counterYtList += 1;
            if (this.counterYtList < this.playListMap.size) {
                this.playList(this.counterYtList); 
            }else{
                // PlayList finished
            }
        });
    }
}

