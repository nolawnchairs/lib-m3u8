
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
0.ts
#EXTINF:6.006000,
1.ts
#EXTINF:6.006000,
2.ts
#EXTINF:6.006000,
3.ts
#EXTINF:6.006000,
4.ts
#EXTINF:6.006000,
5.ts
#EXTINF:6.006000,
6.ts
#EXTINF:5.972633,
7.ts
#EXTINF:6.006000,
8.ts
#EXTINF:6.006000,
9.ts
#EXTINF:6.006000,
10.ts
#EXTINF:2.068733,
11.ts
#EXT-X-ENDLIST
`
const TO = `
#EXTM3U
#EXT-X-VERSION:6
#EXT-X-TARGETDURATION:6
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-INDEPENDENT-SEGMENTS
#EXT-X-KEY:METHOD=AES-128,URI="encryption.key",IV=0xb7cb82dd5e12261c81eb13eba84e9ca4
#EXTINF:6.006000,
0.ts
#EXTINF:6.006000,
1.ts
#EXTINF:6.006000,
2.ts
#EXTINF:6.006000,
3.ts
#EXTINF:6.006000,
4.ts
#EXTINF:6.006000,
5.ts
#EXTINF:6.006000,
6.ts
#EXTINF:5.972633,
7.ts
#EXTINF:6.006000,
8.ts
#EXTINF:6.006000,
9.ts
#EXTINF:6.006000,
10.ts
#EXTINF:2.068733,
11.ts
#EXT-X-ENDLIST
`
describe('transition slices', () => {

  const from = new MediaM3u8(FROM)
  const to = new MediaM3u8(TO)

  let fromSlicer: M3u8Slicer
  let toSlicer: M3u8Slicer

  const fromResolver = new TargetResolver(
    key => key,
    src => `from/${src}`,
  )

  const toResolver = new TargetResolver(
    key => key,
    src => `to/${src}`,
  )

  beforeEach(() => {
    fromSlicer = new M3u8Slicer(from, fromResolver)
    toSlicer = new M3u8Slicer(to, toResolver)
  })

  it('should create a slice without an active transition', () => {
    const transition = fromSlicer.toLiveTransitionSlice(0, 0, toSlicer)
    expect(transition.segments.length).toBe(3)
    expect(transition.segments[0].source).toEqual('from/0.ts')
    expect(transition.segments[1].source).toEqual('from/1.ts')
    expect(transition.segments[2].source).toEqual('from/2.ts')
    expect(transition.marshal().split('\n').length).toBe(11)
  })

  it('should create a slice with the transition at the last segment', () => {
    const transition = fromSlicer.toLiveTransitionSlice(0, 1, toSlicer)
    const marshalled = transition.marshal().split('\n')
    expect(transition.segments.length).toBe(3)
    expect(transition.segments[0].source).toEqual('from/1.ts')
    expect(transition.segments[1].source).toEqual('from/2.ts')
    expect(transition.segments[2].source).toEqual('to/3.ts')
    expect(marshalled.length).toBe(13)
    expect(marshalled[9]).toBe('#EXT-X-DISCONTINUITY')
    expect(marshalled[10]).toContain('#EXT-X-KEY')
    expect(marshalled[11]).toContain('#EXTINF')
  })

  it('should create a slice with the transition at the middle segment', () => {
    const transition = fromSlicer.toLiveTransitionSlice(0, 2, toSlicer)
    const marshalled = transition.marshal().split('\n')
    expect(transition.segments.length).toBe(3)
    expect(transition.segments[0].source).toEqual('from/2.ts')
    expect(transition.segments[1].source).toEqual('to/3.ts')
    expect(transition.segments[2].source).toEqual('to/4.ts')
    expect(marshalled.length).toBe(13)
    expect(marshalled[7]).toBe('#EXT-X-DISCONTINUITY')
    expect(marshalled[8]).toContain('#EXT-X-KEY')
    expect(marshalled[9]).toContain('#EXTINF')
  })

  it('should cycle back to without transition', () => {
    const transition = fromSlicer.toLiveTransitionSlice(0, 3, toSlicer)
    expect(transition.segments.length).toBe(3)
    expect(transition.segments[0].source).toEqual('from/3.ts')
    expect(transition.segments[1].source).toEqual('from/4.ts')
    expect(transition.segments[2].source).toEqual('from/5.ts')
    expect(transition.marshal().split('\n').length).toBe(11)
  })

  it('should cycle back to a slice with the transition at the last segment', () => {
    const transition = fromSlicer.toLiveTransitionSlice(0, 4, toSlicer)
    const marshalled = transition.marshal().split('\n')
    expect(transition.segments.length).toBe(3)
    expect(transition.segments[0].source).toEqual('from/4.ts')
    expect(transition.segments[1].source).toEqual('from/5.ts')
    expect(transition.segments[2].source).toEqual('to/6.ts')
    expect(transition.marshal().split('\n').length).toBe(13)
    expect(marshalled[9]).toBe('#EXT-X-DISCONTINUITY')
    expect(marshalled[10]).toContain('#EXT-X-KEY')
    expect(marshalled[11]).toContain('#EXTINF')
  })

  it('should cycle back to a slice with the transition at the middle segment', () => {
    const transition = fromSlicer.toLiveTransitionSlice(0, 5, toSlicer)
    const marshalled = transition.marshal().split('\n')
    expect(transition.segments.length).toBe(3)
    expect(transition.segments[0].source).toEqual('from/5.ts')
    expect(transition.segments[1].source).toEqual('to/6.ts')
    expect(transition.segments[2].source).toEqual('to/7.ts')
    expect(transition.marshal().split('\n').length).toBe(13)
    expect(marshalled[7]).toBe('#EXT-X-DISCONTINUITY')
    expect(marshalled[8]).toContain('#EXT-X-KEY')
    expect(marshalled[9]).toContain('#EXTINF')
  })
})
