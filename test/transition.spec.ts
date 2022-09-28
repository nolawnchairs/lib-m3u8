
import { MediaM3u8 } from '../src/media-m3u8.class'
import { M3u8Slicer } from '../src/m3u8-slicer.class'
import { TargetResolver } from '../src/util/target-resolver.util'

const FROM = `
#EXTM3U
#EXT-X-VERSION:6
#EXT-X-TARGETDURATION:6
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-INDEPENDENT-SEGMENTS
#EXT-X-KEY:METHOD=AES-128,URI="encryption.key",IV=0xb7cb82dd5e12261c81eb13eba84e9ca3
#EXTINF:6.006000,
0-from.ts
#EXTINF:6.006000,
1-from.ts
#EXTINF:6.006000,
2-from.ts
#EXTINF:6.006000,
3-from.ts
#EXTINF:6.006000,
4-from.ts
#EXTINF:6.006000,
5-from.ts
#EXTINF:6.006000,
6-from.ts
#EXTINF:5.972633,
7-from.ts
#EXTINF:6.006000,
8-from.ts
#EXTINF:6.006000,
9-from.ts
#EXTINF:6.006000,
10-from.ts
#EXTINF:2.068733,
11-from.ts
#EXT-X-ENDLIST
`
const TO = `
#EXTM3U
#EXT-X-VERSION:6
#EXT-X-TARGETDURATION:6
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-INDEPENDENT-SEGMENTS
#EXT-X-KEY:METHOD=AES-128,URI="encryption.key",IV=0xb7cb82dd5e12261c81eb13eba84e9ca3
#EXTINF:6.006000,
0-to.ts
#EXTINF:6.006000,
1-to.ts
#EXTINF:6.006000,
2-to.ts
#EXTINF:6.006000,
3-to.ts
#EXTINF:6.006000,
4-to.ts
#EXTINF:6.006000,
5-to.ts
#EXTINF:6.006000,
6-to.ts
#EXTINF:5.972633,
7-to.ts
#EXTINF:6.006000,
8-to.ts
#EXTINF:6.006000,
9-to.ts
#EXTINF:6.006000,
10-to.ts
#EXTINF:2.068733,
11-to.ts
#EXT-X-ENDLIST
`
describe('transition slices', () => {

  const from = new MediaM3u8(FROM)
  const to = new MediaM3u8(TO)

  let fromSlicer: M3u8Slicer
  let toSlicer: M3u8Slicer

  const resolver = new TargetResolver(
    keyLine => keyLine,
    value => value
  )

  beforeEach(() => {
    fromSlicer = new M3u8Slicer(from, resolver)
    toSlicer = new M3u8Slicer(to, resolver)
  })

  it('should create a slice without an active transition', () => {
    const transition = fromSlicer.toLiveTransitionSlice(0, 0, toSlicer)
    expect(transition.segments.length).toBe(3)
    expect(transition.segments[0].source).toEqual('0-from.ts')
    expect(transition.segments[1].source).toEqual('1-from.ts')
    expect(transition.segments[2].source).toEqual('2-from.ts')
  })

  it('should create a slice with the transition at the last segment', () => {
    const transition = fromSlicer.toLiveTransitionSlice(0, 1, toSlicer)
    expect(transition.segments.length).toBe(3)
    expect(transition.segments[0].source).toEqual('1-from.ts')
    expect(transition.segments[1].source).toEqual('2-from.ts')
    expect(transition.segments[2].source).toEqual('3-to.ts')
  })

  it('should create a slice with the transition at the middle segment', () => {
    const transition = fromSlicer.toLiveTransitionSlice(0, 2, toSlicer)
    expect(transition.segments.length).toBe(3)
    expect(transition.segments[0].source).toEqual('2-from.ts')
    expect(transition.segments[1].source).toEqual('3-to.ts')
    expect(transition.segments[2].source).toEqual('4-to.ts')
  })

  it('should cycle back to without transition', () => {
    const transition = fromSlicer.toLiveTransitionSlice(0, 3, toSlicer)
    expect(transition.segments.length).toBe(3)
    expect(transition.segments[0].source).toEqual('3-from.ts')
    expect(transition.segments[1].source).toEqual('4-from.ts')
    expect(transition.segments[2].source).toEqual('5-from.ts')
  })

  it('should cycle back to a slice with the transition at the last segment', () => {
    const transition = fromSlicer.toLiveTransitionSlice(0, 4, toSlicer)
    expect(transition.segments.length).toBe(3)
    expect(transition.segments[0].source).toEqual('4-from.ts')
    expect(transition.segments[1].source).toEqual('5-from.ts')
    expect(transition.segments[2].source).toEqual('6-to.ts')
  })

  it('should cycle back to a slice with the transition at the middle segment', () => {
    const transition = fromSlicer.toLiveTransitionSlice(0, 5, toSlicer)
    expect(transition.segments.length).toBe(3)
    expect(transition.segments[0].source).toEqual('5-from.ts')
    expect(transition.segments[1].source).toEqual('6-to.ts')
    expect(transition.segments[2].source).toEqual('7-to.ts')
  })
})
