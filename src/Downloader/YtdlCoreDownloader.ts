import ytdl from 'ytdl-core';
import fs from 'fs';
import {IVideoDownloader} from './types';
import { IDownloadResult } from './types';
import path from 'path';
import { IVideoSegment } from 'src/utils/IVideoSegment';
import { url } from 'inspector';

export class YtdlCoreDownloader implements IVideoDownloader{
    private baseOutputDir: string;
    private downloadDir: string;

    constructor(baseOutputDir: string){
        this.baseOutputDir = baseOutputDir;
        this.downloadDir = path.join(this.baseOutputDir, "downloads");
    }

    // Helper function to download all videos
    public async downloadAllVideos(inputs: IVideoSegment[]): Promise<IVideoSegment[]> {
        const urlSet: {[key:string]: string | null} = {};
        inputs.forEach((input, i) => {
            if (urlSet[input.URL] == null) {urlSet[input.URL] = null}
        })
        const downloadPromises = Object.keys(urlSet).map(URL => this.downloadVideo(URL));
        const downloadRes = await Promise.all(downloadPromises);
        downloadRes.forEach(res => urlSet[res.inputUrl] = res.outputFullPath);
        inputs.forEach(input => input.downloadedVideoFilePath = urlSet[input.URL]);
        return inputs;
    }


    public async downloadVideo(videoUrl: string): Promise<IDownloadResult> {
        return new Promise(async (resolve, reject) => {
            try {
                const videoInfo = await ytdl.getInfo(videoUrl);
                const bestFormat = this.getHighestQualityFormat(videoInfo.formats);

                if (!bestFormat) {
                    throw new Error(`No suitable format found for ${videoUrl}`);
                }
                console.log(`Found best format for ${videoUrl}: ${bestFormat.qualityLabel}`);
                
                const outputTitle = this.getOutputFilename(videoUrl) + ".mp4";
                const outputFullPath = path.join(this.downloadDir, outputTitle);
        
        
                const writeStream = fs.createWriteStream(outputFullPath);

                ytdl(videoUrl, { format: bestFormat })
                    .pipe(writeStream)
                    .on('finish', () => {
                        console.log(`Video "${outputTitle}" downloaded in ${this.downloadDir} successfully!`);
                        resolve({
                            inputUrl: videoUrl,
                            outputFullPath: outputFullPath
                        });
                    })
                    .on('error', (err) => {
                        console.error('Error downloading video:', err);
                        reject();
                    });
            } catch (err) {
                console.error('Error:', err);
                reject();
            }
        });
    }

    public getOutputFilename(videoUrl: string): (string|null){
        const urlObj = new URL(videoUrl);
        const params = new URLSearchParams(urlObj.search);
        return params.get('v');
    }

    // Function to determine the best quality format
    private getHighestQualityFormat(formats: ytdl.videoFormat[]): ytdl.videoFormat | null{
        let highestQualityFormat = null;
        for (const format of formats) {
            // Prioritize formats with both video and audio
            if (format.hasVideo && format.hasAudio) {
                if (!highestQualityFormat || format.qualityLabel > highestQualityFormat.qualityLabel)  {
                    highestQualityFormat = format;
                }
            }
        }
        return highestQualityFormat;
    }
};