
import { MediaM3u8 } from '../src/media-m3u8.class'
import { M3u8Slicer } from '../src/m3u8-slicer.class'
import { TargetResolver } from '../src/util/target-resolver.util'
import { M3u8Tag } from '../src/enums/m3u8-tag.enum'

const SPECIMEN = `
#EXTM3U
#EXT-X-VERSION:6
#EXT-X-TARGETDURATION:6
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-INDEPENDENT-SEGMENTS
#EXT-X-KEY:METHOD=AES-128,URI="encryption.key",IV=0xb7cb82dd5e12261c81eb13eba84e9ca3
#EXTINF:6.006000,
960x540-2000kbps_f8a1ae2a59a2b2f7.ts
#EXTINF:6.006000,
960x540-2000kbps_23222e7e8b6b1494.ts
#EXTINF:6.006000,
960x540-2000kbps_457d5113a92ea5b6.ts
#EXTINF:6.006000,
960x540-2000kbps_f2d29dd65a052b14.ts
#EXTINF:6.006000,
960x540-2000kbps_8b54a11735c40542.ts
#EXTINF:5.972633,
960x540-2000kbps_7461ea56e5f5d964.ts
#EXTINF:6.006000,
960x540-2000kbps_5445f203bad03f6c.ts
#EXTINF:6.006000,
960x540-2000kbps_fd33e3f4aed0ae41.ts
#EXTINF:6.006000,
960x540-2000kbps_431a5b4097d066e0.ts
#EXTINF:2.068733,
960x540-2000kbps_211f1e36f293d1b6.ts
#EXT-X-ENDLIST
`

describe('immutable slice modifiers', () => {

  const resolver = new TargetResolver(
    value => value.replace('encryption.key', '/keys/12345/encryption.key'),
    value => `https://example.com/${value}`
  )
  const m3u8 = new MediaM3u8(SPECIMEN)
  const slicer = new M3u8Slicer(m3u8, resolver)

  it('should insert meta tags', () => {
    const slice = slicer.toVodSlice(0, m3u8.segmentCount())
    const inserted1 = slice.insertMeta(M3u8Tag.EXT_X_BYTERANGE, '12345@0')
    const inserted2 = slice.insertMeta(M3u8Tag.EXT_X_BYTERANGE, '12345@0', ({ tag }) => tag == M3u8Tag.EXT_X_MEDIA_SEQUENCE)
    expect(inserted1.meta.find(line => line.tag === M3u8Tag.EXT_X_BYTERANGE)?.content).toBe('#EXT-X-BYTERANGE:12345@0')
    expect(inserted2.meta.findIndex(line => line.tag === M3u8Tag.EXT_X_BYTERANGE)).toBe(4)
    expect(inserted2.meta.findIndex(line => line.tag === M3u8Tag.EXT_X_MEDIA_SEQUENCE)).toBe(3)
  })

  it('should throw an error if meta tag already exists', () => {
    const slice = slicer.toVodSlice(0, m3u8.segmentCount())
    expect(() => slice.insertMeta(M3u8Tag.EXT_X_TARGETDURATION, '10')).toThrowError(/already exists/)
  })

  it('should throw and error if the predicate did not match any tags', () => {
    const slice = slicer.toVodSlice(0, m3u8.segmentCount())
    expect(() => slice.insertMeta(M3u8Tag.EXT_X_BYTERANGE, '12345@0', () => false)).toThrowError(/did not match/)
  })

  it('should modify valid meta tags', () => {
    const slice = slicer.toVodSlice(0, m3u8.segmentCount())
    const modified = slice.modifyMeta(M3u8Tag.EXT_X_TARGETDURATION, () => '10')
    expect(modified.meta.find(line => line.tag === M3u8Tag.EXT_X_TARGETDURATION)?.content).toBe('10')
  })

  it('should omit valid meta tags', () => {
    const slice = slicer.toVodSlice(0, m3u8.segmentCount())
    const modified = slice.omitMeta(M3u8Tag.EXT_X_PLAYLIST_TYPE)
    expect(modified.meta.find(line => line.tag === M3u8Tag.EXT_X_PLAYLIST_TYPE)).toBeUndefined()
  })

  it('should throw an error if meta tag not found', () => {
    const modifiable = slicer.toVodSlice(0, m3u8.segmentCount())
    const omittable = slicer.toVodSlice(0, m3u8.segmentCount())
    expect(() => modifiable.modifyMeta(M3u8Tag.EXT_X_BYTERANGE, () => '')).toThrowError(/not found/)
    expect(() => omittable.omitMeta(M3u8Tag.EXT_X_BYTERANGE)).toThrowError(/not found/)
  })

  it('should modify each segment\'s content', () => {
    const slice = slicer.toVodSlice(0, 5)
    const modified = slice.modifyEachSegment(({ source, ...rest }) => ({
      ...rest,
      source: source.replace('example.com', 'example.org'),
    }))
    expect(modified.segments.every(segment => segment.source.includes('example.org'))).toBe(true)
  })

  it('should modify a segment\'s metadata', () => {
    const slice = slicer.toVodSlice(0, 5)
    const modified = slice.modifySegmentMeta(
      M3u8Tag.EXT_X_KEY, ({ value }) => value.replace('/keys/', 'https://example.com/keys/'))
    expect(modified.segments.some(segment => segment.meta.find(line =>
      line.tag === M3u8Tag.EXT_X_KEY)?.content.includes('example.com'))).toBe(true)
  })

  it('should omit segment metadata', () => {
    const slice = slicer.toVodSlice(0, 5)
    const modified = slice.omitSegmentMeta(M3u8Tag.EXT_X_KEY)
    expect(modified.segments.every(segment => segment.meta.find(line =>
      line.tag === M3u8Tag.EXT_X_KEY))).toBe(false)
  })

  it('should throw an error if segment meta tag not found at least once', () => {
    const slice = slicer.toVodSlice(0, 5)
    expect(() => slice.modifySegmentMeta(M3u8Tag.EXT_X_BYTERANGE, () => '')).toThrowError(/not found/)
    expect(() => slice.omitSegmentMeta(M3u8Tag.EXT_X_BYTERANGE)).toThrowError(/not found/)
  })

  it('should respect immutability', () => {
    const slice = slicer.toVodSlice(0, 5)
    const other = slice.clone()
    expect(slice).not.toBe(other)
    expect(slice.meta).not.toBe(other.meta)
    expect(slice.segments).not.toBe(other.segments)
    expect(slice.segments[0]).not.toBe(other.segments[0])
    expect(slice.segments[0].meta).not.toBe(other.segments[0].meta)
    expect(slice.segments[0].source).toBe(other.segments[0].source)
  })

})
