import { IVideoSegment } from "src/utils/IVideoSegment";

export interface IDownloadResponse{
    inputUrl: string
    outputFullPath: string
}

export interface IVideoDownloader{
    downloadVideo(videoUrl: string, downloadDIR?: string): Promise<IDownloadResponse>;
    downloadAllVideos(input: string[], downloadDir?: string): Promise<IDownloadResponse[]>;
}