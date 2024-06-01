import { IVideoSegment } from "src/utils/IVideoSegment";

export interface IDownloadResult{
    inputUrl: string
    outputFullPath: string
}

export interface IVideoDownloader{
    downloadVideo(videoUrl: string, outputDIR: string): Promise<IDownloadResult>;
    downloadAllVideos(input: IVideoSegment[], downloadDir: string): Promise<IVideoSegment[]>;
}