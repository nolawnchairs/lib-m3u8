
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

describe('parsing a live slice m3u8 file', () => {

  const resolver = new TargetResolver(
    value => value.replace('encryption.key', '/keys/12345/encryption.key'),
    value => `https://example.com/12345/${value}`
  )
  const m3u8 = new MediaM3u8(SPECIMEN)
  const slicer = new M3u8Slicer(m3u8, resolver)

  it('should have the proper header after marshaling', () => {
    const slice = slicer.toLiveSlice(0, 0, 10).marshal()
    const lines = slice.toString().split('\n')
    expect(lines[0]).toBe(M3u8Tag.EXT_M3U)
  })

  it('should have the EXT_X_VERSION line', () => {
    const slice = slicer.toLiveSlice(0, 0, 10).marshal()
    const lines = slice.toString().split('\n')
    expect(lines[1]).toBe('#EXT-X-VERSION:6')
  })

  it('should have the EXT_X_TARGETDURATION line', () => {
    const slice = slicer.toLiveSlice(0, 0, 10).marshal()
    const lines = slice.toString().split('\n')
    expect(lines[2]).toBe('#EXT-X-TARGETDURATION:6')
  })

  it('should have the EXT_X_PLAYLIST_TYPE as EVENT line if DVR', () => {
    const slice = slicer.toLiveSlice(0, 0, 10, true).marshal()
    const lines = slice.toString().split('\n')
    expect(lines[4]).toBe('#EXT-X-PLAYLIST-TYPE:EVENT')
  })

  it('should NOT have the EXT_X_PLAYLIST_TYPE line if not DVR', () => {
    const slice = slicer.toLiveSlice(0, 0, 10, false).marshal()
    const lines = slice.toString().split('\n')
    expect(lines).not.toContain('#EXT-X-PLAYLIST-TYPE:EVENT')
  })

  it('should have the EXT_X_MEDIA_SEQUENCE line', () => {
    const slice = slicer.toLiveSlice(0, 0, 10).marshal()
    const lines = slice.toString().split('\n')
    expect(lines[3]).toBe('#EXT-X-MEDIA-SEQUENCE:0')
    const slice2 = slicer.toLiveSlice(1234, 0, 10).marshal()
    const lines2 = slice2.toString().split('\n')
    expect(lines2[3]).toBe('#EXT-X-MEDIA-SEQUENCE:1234')
  })

  it('should have the EXT_X_KEY line', () => {
    const slice = slicer.toLiveSlice(0, 0, 10).marshal()
    const lines = slice.toString().split('\n')
    expect(lines[4]).toContain('URI="/keys/12345/encryption.key"')
  })

  it('should have the EXT_X_KEY line when slicing from the middle', () => {
    const slice = slicer.toLiveSlice(0, 2, 3).marshal()
    const lines = slice.toString().split('\n')
    expect(lines[4]).toContain('URI="/keys/12345/encryption.key"')
  })

  it('should consist of 3 segments', () => {
    const slice = slicer.toLiveSlice(0, 0, 3)
    expect(slice.segments.length).toBe(3)
  })

  it('should consist of 10 segments', () => {
    const slice = slicer.toLiveSlice(0, 0, 10)
    expect(slice.segments.length).toBe(10)
  })

  it('should correctly slice all 10 segments', () => {
    const slice = slicer.toLiveSlice(0, 0, 10)
    expect(slice.segments[0].source).toBe('https://example.com/12345/960x540-2000kbps_f8a1ae2a59a2b2f7.ts')
    expect(slice.segments[1].source).toBe('https://example.com/12345/960x540-2000kbps_23222e7e8b6b1494.ts')
    expect(slice.segments[2].source).toBe('https://example.com/12345/960x540-2000kbps_457d5113a92ea5b6.ts')
    expect(slice.segments[3].source).toBe('https://example.com/12345/960x540-2000kbps_f2d29dd65a052b14.ts')
    expect(slice.segments[4].source).toBe('https://example.com/12345/960x540-2000kbps_8b54a11735c40542.ts')
    expect(slice.segments[5].source).toBe('https://example.com/12345/960x540-2000kbps_7461ea56e5f5d964.ts')
    expect(slice.segments[6].source).toBe('https://example.com/12345/960x540-2000kbps_5445f203bad03f6c.ts')
    expect(slice.segments[7].source).toBe('https://example.com/12345/960x540-2000kbps_fd33e3f4aed0ae41.ts')
    expect(slice.segments[8].source).toBe('https://example.com/12345/960x540-2000kbps_431a5b4097d066e0.ts')
    expect(slice.segments[9].source).toBe('https://example.com/12345/960x540-2000kbps_211f1e36f293d1b6.ts')
    expect(slice.segments[10]).toBeUndefined()
  })

  it('should correctly slice the first 3 segments', () => {
    const slice = slicer.toLiveSlice(0, 0, 3)
    expect(slice.segments[0].source).toBe('https://example.com/12345/960x540-2000kbps_f8a1ae2a59a2b2f7.ts')
    expect(slice.segments[1].source).toBe('https://example.com/12345/960x540-2000kbps_23222e7e8b6b1494.ts')
    expect(slice.segments[2].source).toBe('https://example.com/12345/960x540-2000kbps_457d5113a92ea5b6.ts')
    expect(slice.segments[3]).toBeUndefined()
  })

  it('should correctly slice the last 3 segments', () => {
    const slice = slicer.toLiveSlice(0, 7, 3)
    expect(slice.segments[0].source).toBe('https://example.com/12345/960x540-2000kbps_fd33e3f4aed0ae41.ts')
    expect(slice.segments[1].source).toBe('https://example.com/12345/960x540-2000kbps_431a5b4097d066e0.ts')
    expect(slice.segments[2].source).toBe('https://example.com/12345/960x540-2000kbps_211f1e36f293d1b6.ts')
    expect(slice.segments[3]).toBeUndefined()
  })
})
