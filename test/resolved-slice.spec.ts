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
#EXT-X-ENDLIST
`

describe('resolved slices', () => {
  const resolver = new TargetResolver(
    value => value.replace('encryption.key', '/keys/12345/encryption.key'),
    value => `https://example.com/12345/${value}`
  )
  const m3u8 = new MediaM3u8(SPECIMEN)
  const slicer = new M3u8Slicer(m3u8, resolver)

  it('should correctly resolve the encryption key', () => {
    const slice = slicer.toResolvedSlice()
    expect(slice.segments[0].meta[0].value).toEqual(
      'METHOD=AES-128,URI="/keys/12345/encryption.key",IV=0xb7cb82dd5e12261c81eb13eba84e9ca3'
    )
  })

  it('should correctly resolve the segment source urls', () => {
    const slice = slicer.toResolvedSlice()
    const segments = slice.segments
    expect(segments[0].source).toEqual(
      'https://example.com/12345/960x540-2000kbps_f8a1ae2a59a2b2f7.ts'
    )
    expect(segments[2].source).toEqual(
      'https://example.com/12345/960x540-2000kbps_457d5113a92ea5b6.ts'
    )
  })

  it('should retain each segment meta length', () => {
    const slice = slicer.toResolvedSlice()
    const segments = slice.segments
    expect(segments).toHaveLength(3)
    expect(segments[0].meta.length).toEqual(2)
    expect(segments[1].meta.length).toEqual(1)
    expect(segments[2].meta.length).toEqual(1)
  })
})
