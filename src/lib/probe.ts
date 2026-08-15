import { ALL_FORMATS, BlobSource, Input } from 'mediabunny'
import type { VideoInfo } from './types'

/** Read basic metadata (dimensions, fps, duration, audio) from a video file. */
export async function probeFile(file: File): Promise<VideoInfo> {
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS })
  try {
    const video = await input.getPrimaryVideoTrack()
    if (!video) throw new Error('No video track found in this file.')

    const [width, height, duration, audio, stats] = await Promise.all([
      video.getSquarePixelWidth(),
      video.getSquarePixelHeight(),
      input.computeDuration(),
      input.getPrimaryAudioTrack(),
      video.computePacketStats(200),
    ])

    return {
      file,
      width,
      height,
      fps: Math.round(stats.averagePacketRate * 100) / 100,
      duration,
      codec: video.codec,
      hasAudio: !!audio,
    }
  } finally {
    // Input has no explicit dispose; source is a Blob wrapper, GC handles it.
  }
}
