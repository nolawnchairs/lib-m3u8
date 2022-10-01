import { M3u8Slicer } from '../src/m3u8-slicer.class'
import { MediaM3u8 } from '../src/media-m3u8.class'
import { TargetResolver } from '../src/util/target-resolver.util'

const SPECIMEN_1 = `
#EXTM3U
#EXT-X-VERSION:6
#EXT-X-TARGETDURATION:6
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-INDEPENDENT-SEGMENTS
#EXT-X-KEY:METHOD=AES-128,URI="encryption.key",IV=0xb7cb82dd5e12261c81eb13eba84e9ca3
#EXTINF:6.006000,
1-0.ts
#EXTINF:6.006000,
1-1.ts
#EXTINF:6.006000,
1-2.ts
#EXTINF:2.068733,
1-3.ts
#EXT-X-ENDLIST
`

const SPECIMEN_2 = `
#EXTM3U
#EXT-X-VERSION:6
#EXT-X-TARGETDURATION:6
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-INDEPENDENT-SEGMENTS
#EXT-X-KEY:METHOD=AES-128,URI="encryption.key",IV=0xb7cb82dd5e12261c81eb13eba84e9ca3
#EXTINF:6.006000,
2-0.ts
#EXTINF:6.006000,
2-1.ts
#EXTINF:6.006000,
2-2.ts
#EXTINF:2.068733,
2-3.ts
#EXT-X-ENDLIST
`

describe('compose slices', () => {

  const slicer1 = new M3u8Slicer(new MediaM3u8(SPECIMEN_1), TargetResolver.default())
  const slicer2 = new M3u8Slicer(new MediaM3u8(SPECIMEN_2), TargetResolver.default())

  it('should compose 1 segment from the first and two of the second', () => {
    const slice1 = slicer1.toLiveSlice(0, 0, 1)
    const slice2 = slicer2.toLiveSlice(0, 0, 2)
    const composed = M3u8Slicer.compose(slice1, slice2)
    expect(composed.segments.length).toBe(3)
    expect(composed.segments[0].source).toBe('1-0.ts')
    expect(composed.segments[1].source).toBe('2-0.ts')
    expect(composed.segments[2].source).toBe('2-1.ts')
  })

  it('should compose 2 segments from the first and one of the second', () => {
    const slice1 = slicer1.toLiveSlice(0, 0, 2)
    const slice2 = slicer2.toLiveSlice(0, 2, 1)
    const composed = M3u8Slicer.compose(slice1, slice2)
    expect(composed.segments.length).toBe(3)
    expect(composed.segments[0].source).toBe('1-0.ts')
    expect(composed.segments[1].source).toBe('1-1.ts')
    expect(composed.segments[2].source).toBe('2-2.ts')
  })

  it('should compose 1 segment from all 3 slices', () => {
    const slice1 = slicer1.toLiveSlice(0, 0, 1)
    const slice2 = slicer2.toLiveSlice(0, 1, 1)
    const slice3 = slicer2.toLiveSlice(0, 3, 1)
    const composed = M3u8Slicer.compose(slice1, slice2, slice3)
    expect(composed.segments.length).toBe(3)
    expect(composed.segments[0].source).toBe('1-0.ts')
    expect(composed.segments[1].source).toBe('2-1.ts')
    expect(composed.segments[2].source).toBe('2-3.ts')
  })
})
