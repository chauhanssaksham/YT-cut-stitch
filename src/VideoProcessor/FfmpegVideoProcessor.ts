import ffmpeg from 'fluent-ffmpeg';
import pathToFfmpeg from 'ffmpeg-static';
import ffprobe from 'ffprobe-static';
import path from 'path'
import { IVideoSegment } from 'src/utils/IVideoSegment';
import { IVideoProcessor, IVideoProcessorInput } from './types';

export class FfmpegVideoProcessor implements IVideoProcessor {
    private processingOutputDir: string;

    constructor(processingOutputDir: string){
        this.processingOutputDir = processingOutputDir;
    }

    public async stitchVideos(inputVideoSegments: IVideoProcessorInput[]): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                // Process video segments in parallel
                const segmentPromises = inputVideoSegments.map((videoSegment, index) => (
                    this.cutSegment(videoSegment, index)
                ));
                await Promise.all(segmentPromises);

                console.log("Segments created!");
                
                // Merge temp segments
                let mergeCommand = ffmpeg()
                    .setFfmpegPath(pathToFfmpeg as string)
                    .setFfprobePath(ffprobe.path)
                for (let i = 0; i < inputVideoSegments.length; i++) {
                    mergeCommand = 
                        mergeCommand.input(this.getProcessedSegmentName(i));
                }
                mergeCommand
                    .complexFilter({
                        filter: 'volume',  
                        options: '1.3'  // Multiplies the volume by 1.4    
                    })
                    .mergeToFile(path.join(this.processingOutputDir, "final.mp4"), "temp")
                    // .withVideoCodec('libx264')
                    // .withAudioCodec('aac')
                    .on('end', res => {
                        console.log("Videos stitched successfully!");
                        resolve(res);
                    })
                    .on('error', reject);
            } catch (err) {
                console.error('Error in FgmpegVideoProcessor:', err);
                reject(err);
            }
        });
    }

    // **Function to process a single video segment**
    private async cutSegment(videoSegment: IVideoProcessorInput, i: number): Promise<any> {
        return new Promise((resolve, reject) => {
            ffmpeg(videoSegment.videoPath)
                .setFfmpegPath(pathToFfmpeg as string)
                .setFfprobePath(ffprobe.path)
                .setStartTime(videoSegment.timestamps.start)
                .setDuration(this.getDuration(videoSegment.timestamps))
                .output(this.getProcessedSegmentName(i))
                .size('1280x720')
                .autoPad()
                .withVideoCodec('libx264')
                .withAudioCodec('aac')
                .on('end', () => {
                    console.log(`Cut up ${i}th segment successfully.`);
                    resolve(true);
                })
                .on('error', reject)
                .run();
        });
    }

    private getProcessedSegmentName(i: number): string{
        return path.join(this.processingOutputDir, `temp_segment_${i}.mp4`);
    }

    private parseTime(timeStr: string): number {
        const [hours, minutes, seconds] = timeStr.split(':').map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    }

    private getDuration(timestamps: {start: string, end: string}): number{
        return this.parseTime(timestamps.end) - this.parseTime(timestamps.start);
    }
}
