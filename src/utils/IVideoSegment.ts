export interface IVideoSegment{
    URL: string;
    timestamps: {
        start: string,
        end: string
    },
    downloadedVideoFilePath: string | null // "xyz/downloads/myRNcpS.mp4",
}