import { YtdlCoreDownloader } from './Downloader/YtdlCoreDownloader'; 
import { IVideoSegment } from './utils/IVideoSegment';
import path from 'path';
import { createDirectory, getFormattedDate } from './utils/functions';
import { FfmpegVideoProcessor } from './VideoProcessor/FfmpegVideoProcessor'
import fs from 'fs';
import { IVideoProcessorInput } from './VideoProcessor/types';

// Main processing function
async function processVideos(baseDir?: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
        try {
            const inputStr = fs.readFileSync('./input.json', 'utf-8');
            var input: IVideoSegment[] = JSON.parse(inputStr);
            
            const BASE_DIR:string = baseDir ? baseDir 
                : path.join('.', 'outputs', getFormattedDate(), Date.now().toString());
            console.log("BaseDir = " + BASE_DIR);
            const DOWNLOADS_DIR: string = path.join(BASE_DIR, "downloads");
            const PROCESSING_DIR: string = path.join(BASE_DIR, "processing");
            // Create necessary directories
            createDirectory(DOWNLOADS_DIR);
            createDirectory(PROCESSING_DIR);

            const downloader = new YtdlCoreDownloader(DOWNLOADS_DIR);
            // Download all videos
            const urlSet: {[key:string]: string | null} = {};
            input.forEach((input, i) => {
                if (urlSet[input.URL] == null) {urlSet[input.URL] = null}
            })
            const downloadRes = await downloader.downloadAllVideos(Object.keys(urlSet));
            downloadRes.forEach(res => urlSet[res.inputUrl] = res.outputFullPath);
            input.forEach(input => input.downloadedVideoFilePath = (urlSet[input.URL] as string));
            
            console.log(`Downloaded all videos`);

            const processor = new FfmpegVideoProcessor(PROCESSING_DIR);
            // Stitch videos together
            var processorInput:IVideoProcessorInput[] = input.map(x => ({videoPath: x.downloadedVideoFilePath, timestamps: x.timestamps}))
            await processor.stitchVideos(processorInput);
            console.log(`Stitched successfully in ${BASE_DIR}`);
            resolve();
        } catch (e){
            reject(e);
        }
    })
}

// Run the processing function
processVideos().then(() => {
    console.log("Finished!");
}).catch(error => {
    console.error("An error occurred:", error);
});
