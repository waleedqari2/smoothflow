import { ALL_FORMATS, BlobSource, Input } from 'mediabunny'
import type { VideoInfo } from './types'

/** Read basic metadata (dimensions, fps, duration, audio) from a video file. */
export async function probeFile(file: File): Promise<VideoInfo> {
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS })
  try {
    const video = await input.getPrimaryVideoTrack()
    if (!video) throw new Error('No video track found in this file.')

    // Display dimensions: after pixel-aspect-ratio adjustment AND rotation —
    // phone videos are stored landscape with a 90° rotation flag, and using
    // coded dimensions here would squish portrait footage into a landscape box.
    const [width, height, duration, audio, stats] = await Promise.all([
      video.getDisplayWidth(),
      video.getDisplayHeight(),
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
