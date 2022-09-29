
import { MediaM3u8 } from '../src/media-m3u8.class'
import { MasterM3u8 } from '../src/master-m3u8.class'

const MASTER = `
#EXTM3U
#EXT-X-VERSION:6
#EXT-X-STREAM-INF:BANDWIDTH=401500,RESOLUTION=1920x1080,CODECS="avc1.640029"
1920x1080-365kbps.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=401500,RESOLUTION=640x360,CODECS="avc1.640029"
640x360-365kbps.m3u8
`

const MEDIA = `
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
960x540-2000kbps_431a5b4097d066e0.ts
#EXTINF:2.068733,
960x540-2000kbps_211f1e36f293d1b6.ts
#EXT-X-ENDLIST
`

describe('error handling', () => {

  it('should throw error when parsing invalid master m3u8', () => {
    expect(() => new MasterM3u8(MEDIA)).toThrow()
    expect(() => new MasterM3u8(MASTER)).not.toThrow()
  })

  it('should throw error when parsing invalid media m3u8', () => {
    expect(() => new MediaM3u8(MASTER)).toThrow()
    expect(() => new MediaM3u8(MEDIA)).not.toThrow()
  })
})
