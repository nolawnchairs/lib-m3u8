
import { M3u8LineType } from './enums/m3u8-line-type'
import { M3u8Tag } from './enums/m3u8-tag.enum'
import { IM3u8Line } from './interfaces/m3u8-line.interface'
import { IM3u8MediaSegment } from './interfaces/m3u8-media-segment.interface'
import { M3u8 } from './m3u8.class'
import { M3u8Parser } from './util/m3u8-parser.util'
import { Strings } from './util/string.util'

export class MediaM3u8 extends M3u8 {

  readonly lines: IM3u8Line[]
  readonly segments: IM3u8MediaSegment[] = []
  readonly meta: IM3u8Line[] = []

  /**
   * @param {string} content the m3u8-formatted string
   * @memberof MediaM3u8
   */
  constructor(content: string) {
    super(content, M3u8Parser.parse(content))

    const segmentLines = this.lines.filter(line => [M3u8LineType.SEGMENT_META, M3u8LineType.SEGMENT_SRC].includes(line.type))
    const segmentSourceIndicies = segmentLines
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => line.type === M3u8LineType.SEGMENT_SRC)
      .map(({ index }) => index)

    this.meta = this.lines.filter(line => line.type === M3u8LineType.META)
    let lastIndex = 0

    while (this.segments.length < segmentSourceIndicies.length) {
      const metaLines = segmentLines.slice(lastIndex, segmentSourceIndicies[this.segments.length])
      const duration = metaLines.find(line => line.content.startsWith(M3u8Tag.EXTINF))?.content.split(':')[1]
      this.segments.push({
        meta: metaLines,
        source: segmentLines[segmentSourceIndicies[this.segments.length]].content,
        duration: Strings.toFloat(duration, 6),
      })
      lastIndex += metaLines.length + 1
    }
  }
}
