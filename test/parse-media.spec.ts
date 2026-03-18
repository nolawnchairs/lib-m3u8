
import { M3u8LineType } from '../src/enums/m3u8-line-type.enum'
import { M3u8Tag } from '../src/enums/m3u8-tag.enum'
import { M3u8Type } from '../src/enums/m3u8-type.enum'
import { IM3u8Line } from '../src/interfaces/m3u8-line.interface'
import { MediaM3u8 } from '../src/media-m3u8.class'
import { M3u8Parser } from '../src/util/m3u8-parser.util'

const SPECIMEN = `
#EXTM3U
#EXT-X-VERSION:6
#EXT-X-TARGETDURATION:6
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-INDEPENDENT-SEGMENTS
#EXT-X-KEY:METHOD=AES-128,URI="http://test.com/encryption.key",IV=0xb7cb82dd5e12261c81eb13eba84e9ca3
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

describe('parsing a media m3u8 file', () => {

  let example: IM3u8Line[] = []
  let m3u8: MediaM3u8

  beforeEach(() => {
    example = M3u8Parser.parse(SPECIMEN, M3u8Type.MEDIA)
    m3u8 = new MediaM3u8(SPECIMEN)
  })

  it('should parse to 28 lines', () => {
    expect(example.length).toBe(28)
  })

  it('should correctly find the header', () => {
    expect(example[0].type).toBe(M3u8LineType.HEADER)
    expect(example[0].content).toBe('#EXTM3U')
  })

  it('should correctly find the version', () => {
    expect(example[1].type).toBe(M3u8LineType.META)
    expect(example[1].content).toBe('#EXT-X-VERSION:6')
    expect(example[1].tag).toBe(M3u8Tag.EXT_X_VERSION)
    expect(example[1].value).toBe('6')
  })

  it('should correctly find the target duration', () => {
    expect(example[2].type).toBe(M3u8LineType.META)
    expect(example[2].content).toBe('#EXT-X-TARGETDURATION:6')
    expect(example[2].tag).toBe(M3u8Tag.EXT_X_TARGETDURATION)
    expect(example[2].value).toBe('6')
  })

  it('should find the playlist type', () => {
    expect(example[4].type).toBe(M3u8LineType.META)
    expect(example[4].content).toBe('#EXT-X-PLAYLIST-TYPE:VOD')
    expect(example[4].tag).toBe(M3u8Tag.EXT_X_PLAYLIST_TYPE)
    expect(example[4].value).toBe('VOD')
  })

  it('should find the independent segments', () => {
    expect(example[5].type).toBe(M3u8LineType.META)
    expect(example[5].content).toBe('#EXT-X-INDEPENDENT-SEGMENTS')
    expect(example[5].tag).toBe(M3u8Tag.EXT_X_INDEPENDENT_SEGMENTS)
    expect(example[5].value).toBeUndefined()
  })

  it('should find the key', () => {
    expect(example[6].type).toBe(M3u8LineType.SEGMENT_META)
    expect(example[6].content).toBe('#EXT-X-KEY:METHOD=AES-128,URI="http://test.com/encryption.key",IV=0xb7cb82dd5e12261c81eb13eba84e9ca3')
  })

  it('should find 10 segments', () => {
    expect(example.filter((l) => l.type === M3u8LineType.SEGMENT_META).length).toBe(11)
    expect(example.filter((l) => l.type === M3u8LineType.SEGMENT_SRC).length).toBe(10)
  })

  it('should identify the last segment', () => {
    expect(example[example.length - 3].type).toBe(M3u8LineType.SEGMENT_META)
    expect(example[example.length - 3].content).toBe('#EXTINF:2.068733,')
    expect(example[example.length - 2].type).toBe(M3u8LineType.SEGMENT_SRC)
    expect(example[example.length - 2].content).toBe('960x540-2000kbps_211f1e36f293d1b6.ts')
  })

  it('should identify the end list', () => {
    expect(example[example.length - 1].type).toBe(M3u8LineType.FOOTER)
    expect(example[example.length - 1].content).toBe('#EXT-X-ENDLIST')
  })

  it('should parse to a working m3u8 instance', () => {
    expect(m3u8.meta.length).toBe(5)
    expect(m3u8.segments.length).toBe(10)
    expect(m3u8.segmentCount()).toBe(10)
    expect(m3u8.segments[0].source).toBe('960x540-2000kbps_f8a1ae2a59a2b2f7.ts')
    expect(m3u8.segments[0].duration).toBe(6.006)
    expect(m3u8.segments[0].meta.length).toBe(2)
    expect(m3u8.segments[0].meta[0].content).toContain('0xb7cb82dd5e12261c81eb13eba84e9ca3')
    expect(m3u8.segments[0].meta[1].tag).toBe(M3u8Tag.EXTINF)
    expect(m3u8.segments[1].meta.length).toBe(1)
  })

  it('should correctly format a VOD slice', () => {
    const slice = m3u8.asSlice()
    expect(slice.meta.length).toBe(4)
    expect(slice.segments.length).toBe(10)
    expect(slice.segments[0].source).toBe('960x540-2000kbps_f8a1ae2a59a2b2f7.ts')
    expect(slice.segments[0].duration).toBe(6.006)
    expect(slice.segments[0].meta.length).toBe(2)
    expect(slice.segments[0].meta[0].content).toContain('0xb7cb82dd5e12261c81eb13eba84e9ca3')
    expect(slice.segments[0].meta[1].tag).toBe(M3u8Tag.EXTINF)
    expect(slice.segments[1].meta.length).toBe(1)
  })
})
