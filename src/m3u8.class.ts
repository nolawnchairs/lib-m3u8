
import { M3u8LineType } from './enums/m3u8-line-type.enum'
import { M3u8Tag } from './enums/m3u8-tag.enum'
import { IM3u8Line } from './interfaces/m3u8-line.interface'

export abstract class M3u8 {

  /**
   * @param {string} content the m3u8-formatted string
   * @param {IM3u8Line[]} lines the parsed lines of the m3u8-formatted string
   * @memberof M3u8
   */
  constructor(
    readonly content: string,
    readonly lines: IM3u8Line[]) { }

  /**
   * Returns the value of the first line of the specified tag.
   *
   * @param {M3u8Tag} tag the tag to match
   * @return {*}  {IM3u8Line}
   * @memberof M3u8
   */
  findLineByTag(tag: M3u8Tag): IM3u8Line {
    return this.lines.find(line => line.tag === tag)
  }

  /**
   * Returns the value of the first line of the specified tag and line type.
   *
   * @param {M3u8LineType} type
   * @param {M3u8Tag} tag
   * @return {*}  {IM3u8Line}
   * @memberof M3u8
   */
  findLineTypeByTag(type: M3u8LineType, tag: M3u8Tag): IM3u8Line {
    return this.lines.find(line => line.type === type && line.tag === tag)
  }
}
