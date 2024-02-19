
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

describe('m3u8 manifest exhaustion', () => {

  const m3u8 = new MediaM3u8(SPECIMEN)
  const resolver = new TargetResolver(
    (keyLine) => keyLine,
    (value) => value
  )

  it('should not detect exhaustion', () => {
    const slicer = new M3u8Slicer(m3u8, resolver)
    const sliced = slicer.toLiveSlice(0, 0, 5)
    expect(sliced.segments.length).toBe(5)
    expect(sliced.mediaExhausted).toBe(false)
  })

  it('should detect exhaustion', () => {
    const slicer = new M3u8Slicer(m3u8, resolver)
    const sliced = slicer.toLiveSlice(0, 7, 5)
    expect(sliced.segments.length).toBe(3)
    expect(sliced.mediaExhausted).toBe(true)
  })
})
