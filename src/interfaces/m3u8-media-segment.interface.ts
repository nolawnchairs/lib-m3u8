
import { IM3u8Line } from './m3u8-line.interface'

/**
 * Represents a content segment of an M3U8 file.
 *
 * @export
 * @interface IM3u8MediaSegment
 */
export interface IM3u8MediaSegment {
  /**
   * An array of metadata lines germane to this segment.
   *
   * @type {IM3u8Line[]}
   * @memberof IM3u8MediaSegment
   */
  meta: IM3u8Line[]
  /**
   * The source URL of the segment.
   *
   * @type {string}
   * @memberof IM3u8MediaSegment
   */
  source: string
  /**
   * The duration of the segment, in seconds, as a floating point number.
   *
   * @type {number}
   * @memberof IM3u8MediaSegment
   */
  duration: number
}
