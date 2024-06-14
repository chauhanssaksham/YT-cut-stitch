export interface IVideoProcessor{
    stitchVideos(inputVideoSegments: IVideoProcessorInput[]): Promise<void>
}

export interface IVideoProcessorInput{
    videoPath: string,
    timestamps: {
        start: string,
        end: string
    }
}