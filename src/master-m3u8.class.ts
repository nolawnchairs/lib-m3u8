
import { M3u8LineType } from './enums/m3u8-line-type.enum'
import { M3u8 } from './m3u8.class'
import { M3u8Parser } from './util/m3u8-parser.util'

export class MasterM3u8 extends M3u8 {

  /**
   * @param {string} content the m3u8-formatted string
   * @memberof MasterM3u8
   */
  constructor(content: string) {
    super(content, M3u8Parser.parse(content))
  }

  /**
   * The media variants in the master playlist
   *
   * @return {*}  {string[]}
   * @memberof MasterM3u8
   */
  get variants(): string[] {
    return this.lines
      .filter(({ type }) => type === M3u8LineType.VARIANT_SRC)
      .map(({ content }) => content)
  }
}
