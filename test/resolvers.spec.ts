
import { MediaM3u8 } from '../src/media-m3u8.class'
import { M3u8Slicer } from '../src/m3u8-slicer.class'
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
#EXTINF:4.206969,
960x540-2000kbps_f8a1ae2a59a2b2f8.ts
#EXT-X-DISCONTINUITY
#EXT-X-KEY:METHOD=AES-128,URI="encryption.key",IV=0xc7cb82dd5e12261c81eb13eba84e9ca9
#EXTINF:6.000000,
960x540-2000kbps_f8a1ae2a59a2b2f8.ts
#EXT-X-ENDLIST
`

describe('url and path resolvers', () => {

  const m3u8 = new MediaM3u8(SPECIMEN)

  it('should retain the initial values', () => {
    const resolver = new TargetResolver(
      keyLine => keyLine,
      value => value
    )
    const slicer = new M3u8Slicer(m3u8, resolver)
    const sliced = slicer.toLiveSlice(0, 0, 1)
    expect(sliced.segments[0].source).toBe('960x540-2000kbps_f8a1ae2a59a2b2f7.ts')
    expect(sliced.segments[0].meta[0].value).toContain('URI="encryption.key"')
  })

  it('should apply the specified pipe to the EXT-X-KEY entry', () => {
    const resolver = new TargetResolver(
      keyLine => keyLine.replace('encryption.key', '/keys/encryption.key'),
      value => value
    )
    const slicer = new M3u8Slicer(m3u8, resolver)
    const sliced = slicer.toLiveSlice(0, 0, 1)
    expect(sliced.segments[0].source).toBe('960x540-2000kbps_f8a1ae2a59a2b2f7.ts')
    expect(sliced.segments[0].meta[0].value).toContain('URI="/keys/encryption.key"')
  })

  it('should apply the specified pipe to the segment source', () => {
    const resolver = new TargetResolver(
      keyLine => keyLine,
      value => `http://www.example.com/${value}`
    )
    const slicer = new M3u8Slicer(m3u8, resolver)
    const sliced = slicer.toLiveSlice(0, 0, 1)
    expect(sliced.segments[0].source).toBe('http://www.example.com/960x540-2000kbps_f8a1ae2a59a2b2f7.ts')
    expect(sliced.segments[0].meta[0].value).toContain('URI="encryption.key"')
  })

  it('should apply the pipe to the second key after discontinuity', () => {
    const resolver = new TargetResolver(
      keyLine => keyLine.replace('encryption.key', 'http://www.example.com/keys/encryption.key'),
      value => `http://www.example.com/${value}`
    )
    const slicer = new M3u8Slicer(m3u8, resolver)
    const sliced = slicer.toLiveSlice(0, 0, 3)
    expect(sliced.segments[0].meta[0].value).toContain('URI="http://www.example.com/keys/encryption.key"')
    expect(sliced.segments[0].meta[1].content).toBe('#EXTINF:6.006000,')
    expect(sliced.segments[1].meta[0].value).toBe('4.206969,')
    expect(sliced.segments[2].meta[0].content).toBe('#EXT-X-DISCONTINUITY')
    expect(sliced.segments[2].meta[1].content).toContain('URI="http://www.example.com/keys/encryption.key"')
    expect(sliced.segments[2].meta[2].content).toBe('#EXTINF:6.000000,')
  })
})
