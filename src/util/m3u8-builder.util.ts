
import { M3u8LineType } from '../enums/m3u8-line-type.enum'
import { M3u8Tag } from '../enums/m3u8-tag.enum'
import { IM3u8Line } from '../interfaces/m3u8-line.interface'

export namespace M3u8Builder {

  /**
   * Creates a META m3u8 line.
   *
   * @export
   * @param {M3u8Tag} tag the tag for this line
   * @param {string} value the value for this line
   * @return {*}  {IM3u8Line}
   */
  export function createMetaLine(tag: M3u8Tag, value: string): IM3u8Line {
    return {
      tag,
      value,
      content: value.length ? `${tag}:${value}` : tag,
      type: M3u8LineType.META,
    }
  }

  /**
   * Creates a SEGMENT_META m3u8 line.
   *
   * @export
   * @param {M3u8Tag} tag the tag for this line
   * @param {string} value the value for this line
   * @return {*}  {IM3u8Line}
   */
  export function createSegmentMetaLine(tag: M3u8Tag, value: string): IM3u8Line {
    return {
      tag,
      value,
      content: value.length ? `${tag}:${value}` : tag,
      type: M3u8LineType.SEGMENT_META,
    }
  }
}
