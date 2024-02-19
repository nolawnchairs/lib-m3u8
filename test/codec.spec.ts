
import { SerializationCodec } from '../src'

const INPUT_PAYLOAD = `
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

const OUTPUT_SINGLE = `
key: 123456
affinity: ChannelM3u8
-----
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
`.trim()

const OUTPUT_TWO = `
key: 123456
affinity: ChannelM3u8
-----
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

key: 987654
affinity: ChannelM3u8
-----
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
`.trim()

describe('serialization codec', () => {
  const codec = new SerializationCodec()

  it('should serialize one item', () => {
    const headers = {
      key: '123456',
      affinity: 'ChannelM3u8',
    }
    const serialized = codec.serialize([{ headers, payload: INPUT_PAYLOAD }])
    expect(serialized).toEqual(OUTPUT_SINGLE)
  })

  it('should serialize multiple items', () => {
    const headers = {
      key: '123456',
      affinity: 'ChannelM3u8',
    }
    const serialized = codec.serialize([
      { headers, payload: INPUT_PAYLOAD },
      { headers, payload: INPUT_PAYLOAD },
    ])
    expect(serialized).toEqual(`${OUTPUT_SINGLE}\n\n${OUTPUT_SINGLE}`)
  })

  it('should deserialize one item', () => {
    const deserialized = codec.deserialize(OUTPUT_SINGLE)
    expect(deserialized.length).toBe(1)
    expect(deserialized[0]).toEqual({
      headers: {
        key: '123456',
        affinity: 'ChannelM3u8',
      },
      payload: INPUT_PAYLOAD.trim(),
    })
  })

  it('should deserialize multiple items', () => {
    const deserialized = codec.deserialize(OUTPUT_TWO)
    expect(deserialized.length).toBe(2)
    expect(deserialized[0]).toEqual({
      headers: {
        key: '123456',
        affinity: 'ChannelM3u8',
      },
      payload: INPUT_PAYLOAD.trim(),
    })
    expect(deserialized[1]).toEqual({
      headers: {
        key: '987654',
        affinity: 'ChannelM3u8',
      },
      payload: INPUT_PAYLOAD.trim(),
    })
  })
})
