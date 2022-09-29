
import { M3u8LineType } from '../src/enums/m3u8-line-type.enum'
import { MediaM3u8 } from '../src/media-m3u8.class'

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

describe('parsing a media m3u8 file', () => {

  const example = new MediaM3u8(SPECIMEN)

  it('should parse to 28 lines', () => {
    expect(example.lines.length).toBe(28)
  })

  it('should find 10 segments', () => {
    expect(example.segments.length).toBe(10)
  })

  it('should correctly parse the first segment', () => {
    const segment = example.segments[0]
    expect(segment.duration).toBe(6.006)
    expect(segment.source).toBe('960x540-2000kbps_f8a1ae2a59a2b2f7.ts')
    expect(segment.meta.length).toBe(2)
    expect(segment.meta[0].content).toBe('#EXT-X-KEY:METHOD=AES-128,URI="encryption.key",IV=0xb7cb82dd5e12261c81eb13eba84e9ca3')
    expect(segment.meta[1].content).toBe('#EXTINF:6.006000,')
  })

  it('should correctly parse the second segment', () => {
    const segment = example.segments[1]
    expect(segment.duration).toBe(6.006)
    expect(segment.source).toBe('960x540-2000kbps_23222e7e8b6b1494.ts')
    expect(segment.meta.length).toBe(1)
  })

  it('should correctly parse the last segment', () => {
    const segment = example.segments[9]
    expect(segment.duration).toBe(2.068733)
    expect(segment.source).toBe('960x540-2000kbps_211f1e36f293d1b6.ts')
    expect(segment.meta.length).toBe(1)
  })

  it('should correctly identify the endlist segment', () => {
    expect(example.lines[example.lines.length - 1].type).toBe(M3u8LineType.FOOTER)
    expect(example.lines[example.lines.length - 1].content).toBe('#EXT-X-ENDLIST')
  })
})
