
import { MediaM3u8 } from '../src/media-m3u8.class'
import { M3u8Slicer } from '../src/m3u8-slicer.class'
import { TargetResolver } from '../src/util/target-resolver.util'
import { M3u8Tag } from '../src/enums/m3u8-tag.enum'

const SPECIMEN_1 = `
#EXTM3U
#EXT-X-VERSION:6
#EXT-X-TARGETDURATION:6
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-INDEPENDENT-SEGMENTS
#EXT-X-KEY:METHOD=AES-128,URI="encryption.key",IV=0xb7cb82dd5e12261c81eb13eba84e9ca3
#EXTINF:6.006000,
960x540-2000kbps_fd33e3f4aed0ae41.ts
#EXTINF:6.006000,
960x540-2000kbps_431a5b4097d066e0.ts
#EXTINF:2.068733,
960x540-2000kbps_211f1e36f293d1b6.ts
#EXT-X-ENDLIST
`
const SPECIMEN_2 = `
#EXTM3U
#EXT-X-VERSION:6
#EXT-X-TARGETDURATION:6
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-INDEPENDENT-SEGMENTS
#EXT-X-KEY:METHOD=AES-128,URI="encryption.key",IV=0x44689f4810b2e9d22d8a28b4de4fe834
#EXTINF:6.006000,
960x540-2000kbps_be81e00afe11585d.ts
#EXTINF:5.972633,
960x540-2000kbps_8672e898e3b6c7da.ts
#EXTINF:6.006000,
960x540-2000kbps_b3395a5973cba5ac.ts
#EXTINF:6.006000,
960x540-2000kbps_3ce0565896601ff3.ts
#EXTINF:6.006000,
960x540-2000kbps_2b6e1830c6afd847.ts
#EXTINF:6.006000,
960x540-2000kbps_be2e8655eebf7c61.ts
#EXTINF:5.972633,
960x540-2000kbps_f84c71d7800249e1.ts
#EXTINF:6.006000,
960x540-2000kbps_597cb50938c3943b.ts
#EXTINF:6.006000,
960x540-2000kbps_e57786fff102bd0e.ts
#EXTINF:3.272633,
960x540-2000kbps_432c8db34db87ca5.ts
`
describe('appending discontinuity', () => {

  const first = new MediaM3u8(SPECIMEN_1)
  const second = new MediaM3u8(SPECIMEN_2)

  const firstResolver = new TargetResolver(
    keyLine => keyLine.replace('encryption.key', '/keys/12345/encryption.key'),
    value => `http://example.com/12345/${value}`
  )

  const secondResolver = new TargetResolver(
    keyLine => keyLine.replace('encryption.key', '/keys/67890/encryption.key'),
    value => `http://example.com/67890/${value}`
  )

  let firstSlicer: M3u8Slicer
  let secondSlicer: M3u8Slicer

  beforeEach(() => {
    firstSlicer = new M3u8Slicer(first, firstResolver)
    secondSlicer = new M3u8Slicer(second, secondResolver)
  })

  it('should detect first media exhaustion', () => {
    const slice1 = firstSlicer.toLiveSlice(0, 0, 4)
    const slice2 = firstSlicer.toLiveSlice(0, 0, 3)
    const slice3 = firstSlicer.toLiveSlice(0, 1, 3)
    expect(slice1.mediaExhausted).toBe(true)
    expect(slice2.mediaExhausted).toBe(false)
    expect(slice3.mediaExhausted).toBe(true)
  })

  it('should handle segment overflow', () => {
    const slice1 = firstSlicer.toLiveSlice(0, 10, 3)
    expect(slice1.mediaExhausted).toBe(true)
    expect(slice1.segments.length).toBe(0)
  })

  it('should append second media with discontinuity', () => {
    const slice1 = firstSlicer.toLiveSlice(0, 1, 3)
    const slice2 = secondSlicer.toLiveSlice(0, 0, 1)
    expect(slice1.segments.length).toBe(2)
    expect(slice2.segments.length).toBe(1)
    slice1.appendDiscontinuity(slice2)
    expect(slice1.segments.length).toBe(3)
    const m3u8 = new MediaM3u8(slice1.marshal())
    expect(m3u8.findLineByTag(M3u8Tag.EXT_X_DISCONTINUITY)?.content).toBe(M3u8Tag.EXT_X_DISCONTINUITY)
    expect(m3u8.segments.length).toBe(3)
    expect(m3u8.segments[0].meta[0].value).toContain('0xb7cb82dd5e12261c81eb13eba84e9ca3')
    expect(m3u8.segments[0].meta[0].value).toContain('/keys/12345/encryption.key')
    expect(m3u8.segments[2].meta[0].content).toBe('#EXT-X-DISCONTINUITY')
    expect(m3u8.segments[2].meta[1].content).toContain('0x44689f4810b2e9d22d8a28b4de4fe834')
    expect(m3u8.segments[2].meta[1].content).toContain('/keys/67890/encryption.key')
  })

  it('should append second media with discontinuity immutably', () => {
    const slice1 = firstSlicer.toLiveSlice(0, 0, 3)
    const slice2 = secondSlicer.toLiveSlice(0, 0, 1)
    const slice3 = slice1.withDiscontinuity(slice2)
    expect(slice1.segments.length).toBe(3)
    expect(slice2.segments.length).toBe(1)
    expect(slice3.segments.length).toBe(4)
    expect(slice3).not.toBe(slice1)
    const m3u8 = new MediaM3u8(slice3.marshal())
    expect(m3u8.findLineByTag(M3u8Tag.EXT_X_DISCONTINUITY)?.content).toBe(M3u8Tag.EXT_X_DISCONTINUITY)
    expect(m3u8.segments.length).toBe(4)
    expect(m3u8.segments[0].meta[0].value).toContain('0xb7cb82dd5e12261c81eb13eba84e9ca3')
    expect(m3u8.segments[0].meta[0].value).toContain('/keys/12345/encryption.key')
    expect(m3u8.segments[3].meta[0].content).toBe('#EXT-X-DISCONTINUITY')
    expect(m3u8.segments[3].meta[1].content).toContain('0x44689f4810b2e9d22d8a28b4de4fe834')
    expect(m3u8.segments[3].meta[1].content).toContain('/keys/67890/encryption.key')
  })

  it('should append discontinuity to empty slice', () => {
    const slice1 = firstSlicer.toLiveSlice(0, 0, 0)
    const slice2 = secondSlicer.toLiveSlice(0, 0, 1)
    expect(slice1.segments.length).toBe(0)
    expect(slice2.segments.length).toBe(1)
    const slice3 = slice1.withDiscontinuity(slice2)
  })

  it('should only contain one EXT-X-DISCONTINUITY tag per slice added', () => {
    const slice1 = firstSlicer.toLiveSlice(0, 0, 1)
    const slice2 = secondSlicer.toLiveSlice(0, 0, 1)
    const slice3 = firstSlicer.toLiveSlice(0, 1, 1)
    const slice4 = secondSlicer.toLiveSlice(0, 1, 1)
    const finished = slice1
      .withDiscontinuity(slice2)
      .withDiscontinuity(slice3)
      .withDiscontinuity(slice4)
    expect(finished.segments.length).toBe(4)
    expect(finished.segments.filter(s => s.meta.some(m => m.content === '#EXT-X-DISCONTINUITY')).length).toBe(3)
    expect(finished.marshal().split('\n').filter(l => l === '#EXT-X-DISCONTINUITY').length).toBe(3)
  })

  it('should only contain one EXT-X-DISCONTINUITY tag per slice with > 0 segmetns', () => {
    const slice1 = firstSlicer.toLiveSlice(0, 0, 0)
    const slice2 = secondSlicer.toLiveSlice(0, 1, 1)
    const slice3 = firstSlicer.toLiveSlice(0, 0, 0)
    const slice4 = secondSlicer.toLiveSlice(0, 1, 1)
    const finished = slice1
      .withDiscontinuity(slice2)
      .withDiscontinuity(slice3)
      .withDiscontinuity(slice4)
    expect(finished.segments.length).toBe(2)
    expect(finished.segments.filter(s => s.meta.some(m => m.content === '#EXT-X-DISCONTINUITY')).length).toBe(2)
    expect(finished.marshal().split('\n').filter(l => l === '#EXT-X-DISCONTINUITY').length).toBe(2)
  })
})
