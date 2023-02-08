import { M3u8 } from '../src/m3u8.class'

const MASTER_SPECIMEN = `
#EXTM3U
#EXT-X-VERSION:6

#EXT-X-STREAM-INF:BANDWIDTH=401500,RESOLUTION=1920x1080,CODECS="avc1.640029"
1920x1080-365kbps.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=401500,RESOLUTION=640x360,CODECS="avc1.640029"
640x360-365kbps.m3u8
`

const MEDIA_SPECIMEN = `
#EXTM3U
#EXT-X-VERSION:6
#EXT-X-TARGETDURATION:6
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-INDEPENDENT-SEGMENTS
#EXT-X-KEY:METHOD=AES-128,URI="encryption.key",IV=0xb7cb82dd5e12261c81eb13eba84e9ca3
#EXTINF:6.006000,
960x540-2000kbps_f8a1ae2a59a2b2f7.ts
#EXT-X-ENDLIST
`

describe('discriminating between m3u8 flavors', () => {

  it('should detect master m3u8', () => {
    expect(M3u8.isMaster(MASTER_SPECIMEN)).toBe(true)
  })

  it('should detect media m3u8', () => {
    expect(M3u8.isMedia(MEDIA_SPECIMEN)).toBe(true)
  })
})
