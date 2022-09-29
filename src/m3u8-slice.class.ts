
import { M3u8Tag } from './enums/m3u8-tag.enum'
import { IM3u8Line } from './interfaces/m3u8-line.interface'
import { IM3u8MediaSegment } from './interfaces/m3u8-media-segment.interface'
import { IM3u8Producer } from './interfaces/m3u8-producer.interface'
import { M3u8Builder } from './util/m3u8-builder.util'

export class M3u8Slice implements IM3u8Producer {

  /**
   * @param {IM3u8Line[]} meta the metadata to include in the slice
   * @param {IM3u8MediaSegment[]} segments the media segments to include in the slice
   * @param {number} offsetMillis the offset in milliseconds from the beginning of the stream
   * @param {boolean} mediaExhausted whether the media has been exhausted
   * @param {boolean} terminate whether to terminate the slice with an EXT-X-ENDLIST tag
   * @memberof M3u8Slice
   */
  constructor(
    readonly meta: IM3u8Line[],
    readonly segments: IM3u8MediaSegment[],
    readonly offsetMillis: number,
    readonly mediaExhausted: boolean,
    private readonly terminate: boolean
  ) { }

  /**
   * Gets the total seconds offset from the beginning of the stream
   * that this slice represents
   *
   * @readonly
   * @type {number}
   * @memberof M3u8Slice
   */
  get offsetSeconds(): number {
    return Math.floor(this.offsetMillis / 1000)
  }

  /**
   * Appends another slice to this slice, adding an EXT-X-DISCONTINUITY
   * tag to the first segment of the appended slice. This mutates the
   * current instance.
   *
   * @param {M3u8Slice} nextSlice the slice to append
   * @memberof M3u8Slice
   */
  appendDiscontinuity(nextSlice: M3u8Slice) {
    const [first, ...rest] = nextSlice.segments
    if (first) {
      const appended = [M3u8Builder.createSegmentMetaLine(M3u8Tag.EXT_X_DISCONTINUITY, ''), ...first.meta]
      this.segments.push({
        ...first,
        meta: appended,
      })
      if (rest.length) {
        this.segments.push(...rest)
      }
    }
  }

  /**
   * @memberof M3u8Slice
   * @inheritdoc
   */
  marshal(): string {
    return [
      M3u8Tag.EXT_M3U,
      ...this.meta.map(({ content }) => content),
      ...this.segments.map(({ meta, source }) => [...meta.map(({ content }) => content), source].join('\n')),
      this.terminate ? M3u8Tag.EXT_X_ENDLIST : '',
    ].join('\n').trim()
  }
}
