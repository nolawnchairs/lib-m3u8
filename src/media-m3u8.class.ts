
import { M3u8LineType } from './enums/m3u8-line-type.enum'
import { M3u8Tag } from './enums/m3u8-tag.enum'
import { M3u8Type } from './enums/m3u8-type.enum'
import { IM3u8Line } from './interfaces/m3u8-line.interface'
import { IM3u8MediaSegment } from './interfaces/m3u8-media-segment.interface'
import { M3u8Slice } from './m3u8-slice.class'
import { M3u8Slicer } from './m3u8-slicer.class'
import { M3u8 } from './m3u8.class'
import { M3u8Parser } from './util/m3u8-parser.util'
import { Strings } from './util/string.util'
import { TargetResolver } from './util/target-resolver.util'

export class MediaM3u8 extends M3u8 {

  readonly lines: IM3u8Line[]
  readonly segments: IM3u8MediaSegment[] = []
  readonly meta: IM3u8Line[] = []

  /**
   * @param {string} content the m3u8-formatted string
   * @throws {Error} if the content is not a valid media segment manifest
   * @memberof MediaM3u8
   */
  constructor(content: string) {
    super(M3u8Parser.parse(content, M3u8Type.MEDIA))

    const segmentLines = this.lines.filter(line => [M3u8LineType.SEGMENT_META, M3u8LineType.SEGMENT_SRC].includes(line.type))
    const segmentSourceIndicies = segmentLines
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => line.type === M3u8LineType.SEGMENT_SRC)
      .map(({ index }) => index)

    this.meta = this.lines.filter(line => line.type === M3u8LineType.META)
    let lastIndex = 0

    while (this.segments.length < segmentSourceIndicies.length) {
      const segmentSourceIndex = segmentSourceIndicies[this.segments.length]
      const metaLines = segmentLines.slice(lastIndex, segmentSourceIndex)
      const duration = metaLines.find(line => line.content.startsWith(M3u8Tag.EXTINF))?.content.split(':')[1]
      this.segments.push({
        meta: M3u8Parser.uniqueLineByTag(metaLines),
        source: segmentLines[segmentSourceIndex].content,
        duration: Strings.toFloat(duration, 6),
      })
      lastIndex += metaLines.length + 1
    }
  }

  get content(): string {
    return this.lines.map(({ content }) => content).join('\n')
  }

  /**
   * Get the total segments count
   *
   * @return {*}  {number}
   * @memberof MediaM3u8
   */
  segmentCount(): number {
    return this.segments.length
  }

  /**
   * Outputs the contents to an m3u8 slice
   *
   * @param {TargetResolver} [resolver] optional url/path target resolver instance
   * @return {*}  {M3u8Slice}
   * @memberof MediaM3u8
   */
  asSlice(resolver?: TargetResolver): M3u8Slice {
    return new M3u8Slicer(this, resolver)
      .toVodSlice(0, this.segmentCount())
  }
}
