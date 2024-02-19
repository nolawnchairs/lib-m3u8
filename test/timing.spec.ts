
import { M3u8Slicer } from '../src/m3u8-slicer.class'
import { MediaM3u8 } from '../src/media-m3u8.class'
import { TargetResolver } from '../src/util/target-resolver.util'

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

describe('timing', () => {

  const resolver = new TargetResolver(
    (value) => value.replace('encryption.key', '/keys/12345/encryption.key'),
    (value) => `https://example.com/12345/${value}`
  )
  const m3u8 = new MediaM3u8(SPECIMEN)

  it('should correctly find the duration of each segment', () => {
    expect(m3u8.segments[0].duration).toBe(6.006)
    expect(m3u8.segments[1].duration).toBe(6.006)
    expect(m3u8.segments[2].duration).toBe(6.006)
    expect(m3u8.segments[3].duration).toBe(6.006)
    expect(m3u8.segments[4].duration).toBe(6.006)
    expect(m3u8.segments[5].duration).toBe(5.972633)
    expect(m3u8.segments[6].duration).toBe(6.006)
    expect(m3u8.segments[7].duration).toBe(6.006)
    expect(m3u8.segments[8].duration).toBe(6.006)
    expect(m3u8.segments[9].duration).toBe(2.068733)
  })

  it('should correctly find the time offset', () => {
    const slice1 = new M3u8Slicer(m3u8, resolver).toLiveSlice(0, 1, 3)
    expect(slice1.offsetSeconds).toBe(6)
    expect(slice1.offsetMillis).toBe(6000)
    const slice2 = new M3u8Slicer(m3u8, resolver).toLiveSlice(0, 2, 3)
    expect(slice2.offsetSeconds).toBe(12)
    expect(slice2.offsetMillis).toBe(12000)
  })

  it('should correctly find the time offset if ratio is different', () => {
    const slice1 = new M3u8Slicer(m3u8, resolver, 2).toLiveSlice(0, 1, 3)
    expect(slice1.offsetSeconds).toBe(12)
    expect(slice1.offsetMillis).toBe(12000)
    const slice2 = new M3u8Slicer(m3u8, resolver, 10).toLiveSlice(0, 1, 3)
    expect(slice2.offsetSeconds).toBe(60)
    expect(slice2.offsetMillis).toBe(60000)
    const slice3 = new M3u8Slicer(m3u8, resolver, 0.5).toLiveSlice(0, 6, 3)
    expect(slice3.offsetSeconds).toBe(18)
    expect(slice3.offsetMillis).toBe(18000)
  })
})
