
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

describe('parsing a live slice to a vod slice', () => {

  const resolver = new TargetResolver(
    value => value.replace('encryption.key', '/keys/12345/encryption.key'),
    value => `https://example.com/12345/${value}`
  )
  const m3u8 = new MediaM3u8(SPECIMEN)
  const slicer = new M3u8Slicer(m3u8, resolver)

  it('should return a vod slice of the correct length', () => {
    const slice = slicer.toVodSlice(0, 3)
    expect(slice.segments.length).toBe(3)
  })

  it('should return a vod slice with the correct 0th segment', () => {
    const slice = slicer.toVodSlice(0, 3)
    expect(slice.segments.length).toBe(3)
    expect(slice.segments[0].meta[0].value).toContain('/keys/12345/encryption.key')
    expect(slice.segments[0].meta[0].value).toContain('0xb7cb82dd5e12261c81eb13eba84e9ca3')
    expect(slice.segments[0].source).toBe('https://example.com/12345/960x540-2000kbps_f8a1ae2a59a2b2f7.ts')
  })

  it('should return a vod slice with the correct 2nd segment', () => {
    const slice = slicer.toVodSlice(2, 3)
    expect(slice.segments.length).toBe(3)
    expect(slice.segments[0].meta[0].value).toContain('/keys/12345/encryption.key')
    expect(slice.segments[0].meta[0].value).toContain('0xb7cb82dd5e12261c81eb13eba84e9ca3')
    expect(slice.segments[0].source).toBe('https://example.com/12345/960x540-2000kbps_457d5113a92ea5b6.ts')
  })

  it('should correctly find the version', () => {
    const slice = slicer.toVodSlice(0, 3)
    expect(slice.meta[0].tag).toBe(M3u8Tag.EXT_X_VERSION)
    expect(slice.meta[0].value).toBe('6')
  })

  it('should correctly find the traget duration', () => {
    const slice = slicer.toVodSlice(0, 3)
    expect(slice.meta[1].tag).toBe(M3u8Tag.EXT_X_TARGETDURATION)
    expect(slice.meta[1].value).toBe('6')
  })

  it('should correctly indentify the playlist type as VOD', () => {
    const slice = slicer.toVodSlice(0, 3)
    expect(slice.meta[2].tag).toBe(M3u8Tag.EXT_X_PLAYLIST_TYPE)
    expect(slice.meta[2].value).toBe('VOD')
  })

  it('should contain the correct header and footer after marshaling', () => {
    const lines = slicer.toVodSlice(0, 3).marshal().split('\n')
    expect(lines[0]).toBe(M3u8Tag.EXT_M3U)
    expect(lines[lines.length - 1]).toBe(M3u8Tag.EXT_X_ENDLIST)
  })

  it('should re-evaluate to am M3u8 instance after marshaling', () => {
    const slice = slicer.toVodSlice(0, 3)
    const m3u8 = new MediaM3u8(slice.marshal())
    expect(m3u8).toBeTruthy()
    expect(m3u8.segments.length).toBe(slice.segments.length)
    expect(m3u8.segments[0].source).toBe(slice.segments[0].source)
    expect(m3u8.meta.length).toEqual(slice.meta.length)
  })
})
