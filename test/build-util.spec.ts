
import { M3u8LineType } from '../src/enums/m3u8-line-type.enum'
import { M3u8Tag } from '../src/enums/m3u8-tag.enum'
import { M3u8Builder } from '../src/util/m3u8-builder.util'

describe('build utils', () => {

  it('should create a META m3u8 line', () => {
    const line = M3u8Builder.createMetaLine(M3u8Tag.EXT_X_PLAYLIST_TYPE, 'VOD')
    expect(line.content).toBe('#EXT-X-PLAYLIST-TYPE:VOD')
    expect(line.value).toBe('VOD')
    expect(line.tag).toBe(M3u8Tag.EXT_X_PLAYLIST_TYPE)
    expect(line.type).toBe(M3u8LineType.META)
  })

  it('should create a SEGMENT_META m3u8 line', () => {
    const line1 = M3u8Builder.createSegmentMetaLine(M3u8Tag.EXT_X_BYTERANGE, '1234')
    const line2 = M3u8Builder.createSegmentMetaLine(M3u8Tag.EXTINF, '')
    expect(line1.content).toBe('#EXT-X-BYTERANGE:1234')
    expect(line1.value).toBe('1234')
    expect(line1.tag).toBe(M3u8Tag.EXT_X_BYTERANGE)
    expect(line1.type).toBe(M3u8LineType.SEGMENT_META)
    expect(line2.content).toBe('#EXTINF')
    expect(line2.value).toBe('')
    expect(line2.tag).toBe(M3u8Tag.EXTINF)
    expect(line2.type).toBe(M3u8LineType.SEGMENT_META)
  })
})
