
import { M3u8LineType } from '../src/enums/m3u8-line-type.enum'
import { M3u8Tag } from '../src/enums/m3u8-tag.enum'
import { MediaM3u8 } from '../src/media-m3u8.class'
import { M3u8Parser } from '../src/util/m3u8-parser.util'
import { TargetResolver } from '../src/util/target-resolver.util'

const SPECIMEN = 'METHOD=AES-128,URI="https://example.com/8fsda9hnf98ef/key",IV=0x4db67212768f0070dff137653ca3b78f'
const FULL_M3U8_SPECIMEN = `
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
`.trim()

describe('parsing a key line', () => {

  it('should parse the key line correctly', () => {
    const line = {
      tag: M3u8Tag.EXT_X_KEY,
      type: M3u8LineType.META,
      value: SPECIMEN,
      content: `#EXT-X-KEY:${SPECIMEN}`,
    }
    const keyLine = M3u8Parser.parseKeyLine(line)
    expect(keyLine.method).toBe('AES-128')
    expect(keyLine.uri).toBe('https://example.com/8fsda9hnf98ef/key')
    expect(keyLine.iv).toBe('0x4db67212768f0070dff137653ca3b78f')
  })

  it('should throw an error if the line is not a key line', () => {
    const line = {
      tag: M3u8Tag.EXTINF,
      type: M3u8LineType.META,
      value: '10,',
      content: '#EXTINF:10,',
    }
    expect(() => M3u8Parser.parseKeyLine(line)).toThrow('Line #EXTINF:10, is not a key line.')
  })

  it('should write a key line correctly', () => {
    const keyLine = {
      method: 'AES-128',
      uri: 'https://example.com/8fsda9hnf98ef/key',
      iv: '0x4db67212768f0070dff137653ca3b78f',
    }
    const lineContent = M3u8Parser.writeKeyLine(keyLine)
    expect(lineContent).toBe(SPECIMEN)
  })

  it('should parse an entire m3u8 and resolve the key line URL', () => {
    const m3u8 = new MediaM3u8(FULL_M3U8_SPECIMEN)
    const resolver = new TargetResolver(
      (url) => `https://example.com/12345/key/${url}`,
      (url) => url
    )
    const fixed = m3u8.resolve(resolver).marshal()
    expect(fixed).toContain('URI="https://example.com/12345/key/encryption.key"')
  })
})
