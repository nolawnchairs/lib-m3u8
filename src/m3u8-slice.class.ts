
import { M3u8Tag } from './enums/m3u8-tag.enum'
import { IM3u8Line } from './interfaces/m3u8-line.interface'
import { IM3u8MediaSegment } from './interfaces/m3u8-media-segment.interface'
import { IM3u8Producer } from './interfaces/m3u8-producer.interface'
import { M3u8Builder } from './util/m3u8-builder.util'

type Predicate = (line: IM3u8Line) => boolean
type MetaModifier = (original: string) => string
type SegmentModifier = (original: IM3u8MediaSegment, index: number) => IM3u8MediaSegment
type SegmentMetaModifier = (original: IM3u8Line, segmentIndex: number, metaIndex: number) => string

export class M3u8Slice implements IM3u8Producer {

  /**
   * @param {IM3u8Line[]} meta the metadata to include in the slice
   * @param {IM3u8MediaSegment[]} segments the media segments to include in the
   * slice
   * @param {number} offsetMillis the offset in milliseconds from the beginning
   * of the stream
   * @param {boolean} mediaExhausted whether the media has been exhausted (used
   * for live slices only)
   * @param {boolean} terminate whether to terminate the slice with an
   * EXT-X-ENDLIST tag
   * @memberof M3u8Slice
   */
  constructor(
    readonly meta: IM3u8Line[],
    readonly segments: IM3u8MediaSegment[],
    readonly offsetMillis: number,
    readonly mediaExhausted: boolean,
    readonly terminate: boolean
  ) { }

  /**
   * Gets the total seconds offset from the beginning of the stream that this
   * slice represents
   *
   * @readonly
   * @type {number}
   * @memberof M3u8Slice
   */
  get offsetSeconds(): number {
    return Math.floor(this.offsetMillis / 1000)
  }

  /**
   * Immutably creates a new slice with the specified metadata inserted after
   * the first tag that matches the predicate, or at the end of the metadata if
   * no predicate is provided
   *
   * @param {M3u8Tag} tag the tag to insert
   * @param {string} value the value to insert
   * @param {Predicate} [after] if supplied, the new meta content will be
   * inserted after the first tag that matches the predicate
   * @return {*}  {M3u8Slice}
   * @throws {Error} if the specified tag already exists in the slice
   * @throws {Error} if the predicate, when used, does not match any tags
   * @memberof M3u8Slice
   */
  insertMeta(tag: M3u8Tag, value: string, after?: Predicate): M3u8Slice {
    if (this.meta.some(line => line.tag === tag)) {
      throw new Error(`Metadata tag ${tag} already exists`)
    }
    const clone = this.clone()
    if (after) {
      const index = clone.meta.findIndex(after)
      if (!~index) {
        throw new Error('Predicate did not match any tags')
      }
      clone.meta.splice(index + 1, 0, M3u8Builder.createMetaLine(tag, value))
    } else {
      clone.meta.push(M3u8Builder.createMetaLine(tag, value))
    }
    return clone
  }

  /**
   * Immutably creates a new slice with modified meta content
   *
   * @param {M3u8Tag} tag the tag to modify
   * @param {MetaModifier} modifier the modifier function to apply
   * @return {*}  {M3u8Slice}
   * @throws {Error} if the tag is not found
   * @memberof M3u8Slice
   */
  modifyMeta(tag: M3u8Tag, modifier: MetaModifier): M3u8Slice {
    const clone = this.clone()
    const index = clone.meta.findIndex(line => line.tag === tag)
    if (!~index) {
      throw new Error(`Metadata tag ${tag} not found`)
    }
    clone.meta[index] = M3u8Builder.createMetaLine(tag, modifier(clone.meta[index].value))
    return clone
  }

  /**
   * Immutably creates a new slice with the specified tag removed
   *
   * @param {M3u8Tag} tag the tag to remove
   * @return {*}  {M3u8Slice}
   * @throws {Error} if the tag is not found
   * @memberof M3u8Slice
   */
  omitMeta(tag: M3u8Tag): M3u8Slice {
    const clone = this.clone()
    const index = clone.meta.findIndex(line => line.tag === tag)
    if (!~index) {
      throw new Error(`Metadata tag ${tag} not found`)
    }
    clone.meta.splice(index, 1)
    return clone
  }

  /**
   * Immutably creates a new slice with modified segment content
   *
   * @param {SegmentModifier} modifier the modifier function to apply to each
   * segment
   * @return {*}  {M3u8Slice}
   * @memberof M3u8Slice
   */
  modifyEachSegment(modifier: SegmentModifier): M3u8Slice {
    const clone = this.clone()
    clone.segments.forEach((segment, index) => {
      clone.segments[index] = modifier(segment, index)
    })
    return clone
  }

  /**
   * Immutably creates a new slice with modified segment metadata. The modifier
   * function will be applied to each segment that contains the specified meta
   * tag
   *
   * @param {M3u8Tag} tag the tag to modify in each segment
   * @param {SegmentMetaModifier} modifier the modifier function to apply to
   * each segment that contains the tag
   * @return {*}  {M3u8Slice}
   * @throws {Error} if the tag is not found at least once
   * @memberof M3u8Slice
   */
  modifySegmentMeta(tag: M3u8Tag, modifier: SegmentMetaModifier): M3u8Slice {
    const clone = this.clone()
    const hasTag = clone.segments.some(segment => segment.meta.some(line => line.tag === tag))
    if (!hasTag) {
      throw new Error(`Segment metadata tag ${tag} not found`)
    }
    clone.segments.forEach((segment, index) => {
      const metaIndex = segment.meta.findIndex(line => line.tag === tag)
      if (~metaIndex) {
        const modifiedValue = modifier(segment.meta[metaIndex], index, metaIndex)
        clone.segments[index].meta[metaIndex] = M3u8Builder.createSegmentMetaLine(tag, modifiedValue)
      }
    })
    return clone
  }

  /**
   * Immutably creates a new slice with the specified tag removed from each
   * segment's metadata
   *
   * @param {M3u8Tag} tag the tag to remove from each segment's metadata
   * @return {*}  {M3u8Slice}
   * @throws {Error} if the tag is not found at least once
   * @memberof M3u8Slice
   */
  omitSegmentMeta(tag: M3u8Tag): M3u8Slice {
    const clone = this.clone()
    const hasTag = clone.segments.some(segment => segment.meta.some(line => line.tag === tag))
    if (!hasTag) {
      throw new Error(`Segment metadata tag ${tag} not found`)
    }
    clone.segments.forEach((segment, index) => {
      const metaIndex = segment.meta.findIndex(line => line.tag === tag)
      if (~metaIndex) {
        clone.segments[index].meta.splice(metaIndex, 1)
      }
    })
    return clone
  }

  /**
   * Appends another slice to this slice, adding an EXT-X-DISCONTINUITY tag to
   * the first segment of the appended slice. This mutates the current instance.
   *
   * @param {M3u8Slice} nextSlice the slice to append
   * @memberof M3u8Slice
   */
  appendDiscontinuity(nextSlice: M3u8Slice) {
    if (!nextSlice.segments.length) {
      return
    }
    const [first, ...rest] = nextSlice.segments
    if (first) {
      this.segments.push({
        ...first,
        meta: [
          M3u8Builder.createSegmentMetaLine(M3u8Tag.EXT_X_DISCONTINUITY, ''),
          ...first.meta,
        ],
      })
      if (rest.length) {
        this.segments.push(...rest)
      }
    }
  }

  /**
   * Appends another slice to this slice, adding an EXT-X-DISCONTINUITY tag to
   * the first segment of the appended slice, then returns the new slice.
   *
   * @param {M3u8Slice} nextSlice the slice to append
   * @memberof M3u8Slice
   */
  withDiscontinuity(nextSlice: M3u8Slice): M3u8Slice {
    if (!nextSlice.segments.length) {
      return this
    }
    const [first, ...rest] = nextSlice.segments
    const clone = this.clone()
    if (first) {
      clone.segments.push({
        ...first,
        meta: [
          M3u8Builder.createSegmentMetaLine(M3u8Tag.EXT_X_DISCONTINUITY, ''),
          ...first.meta,
        ],
      })
      if (rest.length) {
        clone.segments.push(...rest)
      }
    }
    return clone
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

  /**
   * Create a deep clone of this slice
   *
   * @return {*}  {M3u8Slice}
   * @memberof M3u8Slice
   */
  clone(): M3u8Slice {
    return new M3u8Slice(
      this.meta.map(line => ({ ...line })),
      this.segments.map(segment => ({
        ...segment,
        meta: segment.meta.map(line => ({ ...line })),
      })),
      this.offsetMillis,
      this.mediaExhausted,
      this.terminate
    )
  }
}
