import { M3u8Tag } from '../src/enums/m3u8-tag.enum'
import { M3u8Slicer } from '../src/m3u8-slicer.class'
import { MediaM3u8 } from '../src/media-m3u8.class'
import { TargetResolver } from '../src/util/target-resolver.util'

const SPECIMEN = `
#EXTM3U
#EXT-X-VERSION:6
#EXT-X-TARGETDURATION:6
#EXT-X-MEDIA-SEQUENCE:100
#EXT-X-INDEPENDENT-SEGMENTS
#EXT-X-KEY:METHOD=AES-128,URI="/keys/12345/encryption.key",IV=0xb7cb82dd5e12261c81eb13eba84e9ca3
#EXTINF:6.006000,
http://example.com/12345/960x540-2000kbps_f8a1ae2a59a2b2f7.ts
#EXTINF:6.006000,
http://example.com/12345/960x540-2000kbps_23222e7e8b6b1494.ts
#EXT-X-DISCONTINUITY
#EXT-X-KEY:METHOD=AES-128,URI="/keys/67890/encryption.key",IV=0xb7cb82dd5e12261c87461ea56e5f5da3
#EXTINF:6.006000,
http://example.com/67890/960x540-2000kbps_457d5113a92ea5b6.ts
#EXTINF:6.006000,
http://example.com/67890/960x540-2000kbps_fd33e3f4aed0ae41.ts
`

describe('clone slices', () => {
  const resolver = new TargetResolver(
    value => value.replace('encryption.key', '/keys/12345/encryption.key'),
    value => `https://example.com/12345/${value}`
  )
  const m3u8 = new MediaM3u8(SPECIMEN)
  const slicer = new M3u8Slicer(m3u8, resolver)

  it('should retain the proper header and meta after cloning', () => {
    const slice = slicer.toClonedSlice().marshal()
    const lines = slice.toString().split('\n')
    expect(lines[0]).toBe(M3u8Tag.EXT_M3U)
    expect(lines[1]).toBe('#EXT-X-VERSION:6')
    expect(lines[2]).toBe('#EXT-X-TARGETDURATION:6')
    expect(lines[3]).toBe('#EXT-X-MEDIA-SEQUENCE:100')
  })

  it('should omit the #EXT-X-ENDLIST line', () => {
    const slice = slicer.toClonedSlice().marshal()
    const lines = slice.toString().split('\n')
    expect(lines[lines.length - 1]).not.toBe('#EXT-X-ENDLIST')
  })

  it('should retain the proper segment count', () => {
    const slice = slicer.toClonedSlice().marshal()
    const lines = slice.toString().split('\n')
    expect(lines.length).toBe(16)
  })

  it('should retain all lines exactly as they were', () => {
    const slice = slicer.toClonedSlice().marshal()
    expect(slice).toBe(SPECIMEN.trim())
  })

  it('should allow extra meta to be added to the header while keeping everything else intact', () => {
    const slice = slicer.toClonedSlice()
      .insertMeta(M3u8Tag.EXT_X_MONTAGE_SOURCE_SEQUENCE, '12345')
    const lines = slice.marshal().split('\n')
    expect(lines[0]).toBe(M3u8Tag.EXT_M3U)
    expect(lines[1]).toBe('#EXT-X-VERSION:6')
    expect(lines[2]).toBe('#EXT-X-TARGETDURATION:6')
    expect(lines[3]).toBe('#EXT-X-MEDIA-SEQUENCE:100')
    expect(lines[4]).toBe('#EXT-X-INDEPENDENT-SEGMENTS')
    expect(lines[5]).toBe('#EXT-X-MONTAGE-SOURCE-SEQUENCE:12345')
    expect(lines[6]).toBe('#EXT-X-KEY:METHOD=AES-128,URI="/keys/12345/encryption.key",IV=0xb7cb82dd5e12261c81eb13eba84e9ca3')
    expect(lines[7]).toBe('#EXTINF:6.006000,')
    expect(lines[8]).toBe('http://example.com/12345/960x540-2000kbps_f8a1ae2a59a2b2f7.ts')
    expect(lines[9]).toBe('#EXTINF:6.006000,')
    expect(lines[10]).toBe('http://example.com/12345/960x540-2000kbps_23222e7e8b6b1494.ts')
    expect(lines[11]).toBe('#EXT-X-DISCONTINUITY')
    expect(lines[12]).toBe('#EXT-X-KEY:METHOD=AES-128,URI="/keys/67890/encryption.key",IV=0xb7cb82dd5e12261c87461ea56e5f5da3')
    expect(lines[13]).toBe('#EXTINF:6.006000,')
    expect(lines[14]).toBe('http://example.com/67890/960x540-2000kbps_457d5113a92ea5b6.ts')
    expect(lines[15]).toBe('#EXTINF:6.006000,')
    expect(lines[16]).toBe('http://example.com/67890/960x540-2000kbps_fd33e3f4aed0ae41.ts')
  })
})
