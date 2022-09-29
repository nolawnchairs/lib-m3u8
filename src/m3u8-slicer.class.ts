
import { M3u8LineType } from './enums/m3u8-line-type.enum'
import { M3u8Tag } from './enums/m3u8-tag.enum'
import { IM3u8MediaSegment } from './interfaces/m3u8-media-segment.interface'
import { M3u8Slice } from './m3u8-slice.class'
import { MediaM3u8 } from './media-m3u8.class'
import { M3u8Builder } from './util/m3u8-builder.util'
import { Strings } from './util/string.util'
import { TargetResolver } from './util/target-resolver.util'

export class M3u8Slicer {

  private readonly targetDurationMillis: number = 0

  /**
   * @param {MediaM3u8} m3u8 the M3u8 instance to slice
   * @param {TargetResolver} resolver the url/path target resolver instance
   * @param {number} [speedRatio=1] the speed ratio to apply to segment durations (defaults to 1 = no change)
   * @memberof M3u8Slicer
   */
  constructor(
    private readonly m3u8: MediaM3u8,
    private readonly resolver: TargetResolver,
    speedRatio: number = 1
  ) {
    const targetDurationLine = m3u8.findLineTypeByTag(M3u8LineType.META, M3u8Tag.EXT_X_TARGETDURATION)
    if (targetDurationLine) {
      this.targetDurationMillis = speedRatio * Strings.toInt(targetDurationLine.value, 6) * 1000
    }
  }

  /**
   * Get the segment count for the given m3u8 subject
   *
   * @readonly
   * @type {number}
   * @memberof LiveM3u8SliceGenerator
   */
  get length(): number {
    return this.m3u8.segments.length
  }

  /**
   * Slice the m3u8 subject into a new manifest for a live stream
   *
   * @param {number} sequence the value for the EXT-X-MEDIA-SEQUENCE tag
   * @param {number} start the index of the first segment to include in the slice
   * @param {number} count the number of segments to include in the slice
   * @return {*}  {M3u8Slice}
   * @memberof M3u8Slicer
   */
  toLiveSlice(sequence: number, start: number, count: number): M3u8Slice {
    const last = start + count
    const meta = [
      this.m3u8.findLineByTag(M3u8Tag.EXT_X_VERSION),
      this.m3u8.findLineByTag(M3u8Tag.EXT_X_TARGETDURATION),
      M3u8Builder.createMetaLine(M3u8Tag.EXT_X_PLAYLIST_TYPE, 'EVENT'),
      M3u8Builder.createMetaLine(M3u8Tag.EXT_X_MEDIA_SEQUENCE, sequence.toString()),
    ]

    const segments = this.marshalSegments(
      this.m3u8.segments.slice(start, last)
    )

    return new M3u8Slice(
      meta,
      segments,
      start * this.targetDurationMillis,
      segments.length < count,
      false
    )
  }

  /**
   * Slice the m3u8 subject into a new manifest for a video-on-demand
   *
   * @param {number} start the index of the first segment to include in the slice
   * @param {number} count the number of segments to include in the slice
   * @return {*}  {M3u8Slice}
   * @memberof M3u8Slicer
   */
  toVodSlice(start: number, count: number): M3u8Slice {
    const last = start + count
    const meta = [
      this.m3u8.findLineByTag(M3u8Tag.EXT_X_VERSION),
      this.m3u8.findLineByTag(M3u8Tag.EXT_X_TARGETDURATION),
      M3u8Builder.createMetaLine(M3u8Tag.EXT_X_PLAYLIST_TYPE, 'VOD'),
      M3u8Builder.createMetaLine(M3u8Tag.EXT_X_MEDIA_SEQUENCE, '0'),
    ]

    const segments = this.marshalSegments(
      this.m3u8.segments.slice(start, last)
    )

    return new M3u8Slice(
      meta,
      segments,
      start * this.targetDurationMillis,
      true,
      true
    )
  }

  /**
   * Slice the m3u8 subject into a new manifest for a live stream transition
   *
   * @param {number} sequence the value for the EXT-X-MEDIA-SEQUENCE tag
   * @param {number} segmentIndex the index of the segment from which to start the transition
   * @param {M3u8Slicer} next the slicer instance to which the transition will be applied
   * @return {*}  {M3u8Slice}
   * @memberof M3u8Slicer
   */
  toLiveTransitionSlice(sequence: number, segmentIndex: number, next: M3u8Slicer): M3u8Slice {
    const mod = segmentIndex % 3
    const from = this.toLiveSlice(sequence, segmentIndex, 3 - mod)
    const to = next.toLiveSlice(sequence, segmentIndex + (mod ? 3 - mod : 0), mod)
    from.appendDiscontinuity(to)
    return from
  }

  /**
   * Marshal an array of segments, injecting values from the target url/path resolver
   *
   * @private
   * @param {IM3u8MediaSegment[]} segments
   * @return {*}  {IM3u8MediaSegment[]}
   * @memberof M3u8Slicer
   */
  private marshalSegments(segments: IM3u8MediaSegment[]): IM3u8MediaSegment[] {
    return segments.map((segment, i) => {
      const { meta, duration } = segment
      if (i == 0 && !meta.find(line => line.tag === M3u8Tag.EXT_X_KEY)) {
        meta.unshift(this.m3u8.findLineByTag(M3u8Tag.EXT_X_KEY))
      }
      const source = this.resolver.resolveSourcePathUrl(segment.source)
      const index = meta.findIndex(m => m.tag === M3u8Tag.EXT_X_KEY)
      if (~index) {
        const { type, tag, value: oldValue } = meta[index]
        const value = this.resolver.resolveEncryptionKeyUrl(oldValue)
        const content = `${M3u8Tag.EXT_X_KEY}:${value}`
        return {
          duration,
          source,
          meta: [
            ...meta.slice(0, index),
            { type, tag, value, content },
            ...meta.slice(index + 1),
          ],
        }
      } else {
        return {
          duration,
          source,
          meta,
        }
      }
    })
  }
}
