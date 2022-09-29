
import { M3u8LineType } from '../enums/m3u8-line-type.enum'
import { M3u8Tag } from '../enums/m3u8-tag.enum'

/**
 * Represents a line in an M3U8 file.
 *
 * @export
 * @interface IM3u8Line
 */
export interface IM3u8Line {
  /**
   * The type of line this is.
   *
   * @type {M3u8LineType}
   * @memberof IM3u8Line
   */
  type: M3u8LineType
  /**
   * The entirety of the line.
   *
   * @type {string}
   * @memberof IM3u8Line
   */
  content: string
  /**
   * The tag of the line, if present
   *
   * @type {M3u8Tag}
   * @memberof IM3u8Line
   */
  tag?: M3u8Tag
  /**
   * The value of the line, if present. If no tag is
   * present, this is identical to the content.
   *
   * @type {string}
   * @memberof IM3u8Line
   */
  value: string
}
