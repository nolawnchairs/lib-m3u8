
import { M3u8LineType } from '../src/enums/m3u8-line-type.enum'
import { IM3u8Line } from '../src/interfaces/m3u8-line.interface'
import { M3u8Parser } from '../src/util/m3u8-parser.util'
import { MasterM3u8 } from '../src/master-m3u8.class'

const SPECIMEN = `
#EXTM3U
#EXT-X-VERSION:6
#EXT-X-STREAM-INF:BANDWIDTH=401500,RESOLUTION=1920x1080,CODECS="avc1.640029"
1920x1080-365kbps.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=401500,RESOLUTION=640x360,CODECS="avc1.640029"
640x360-365kbps.m3u8
`

describe('Parsing a master.m3u8 file', () => {

  let example: IM3u8Line[]
  let m3u8: MasterM3u8

  beforeEach(() => {
    example = M3u8Parser.parse(SPECIMEN)
    m3u8 = new MasterM3u8(SPECIMEN)
  })

  it('should parse to 6 lines', () => {
    expect(example.length).toBe(6)
  })

  it('should correctly find the header', () => {
    expect(example[0].type).toBe(M3u8LineType.HEADER)
    expect(example[0].content).toBe('#EXTM3U')
  })

  it('should correctly find the version', () => {
    expect(example[1].type).toBe(M3u8LineType.META)
    expect(example[1].content).toBe('#EXT-X-VERSION:6')
  })

  it('should correctly find the first variant', () => {
    expect(example[2].type).toBe(M3u8LineType.VARIANT_META)
    expect(example[2].content).toBe('#EXT-X-STREAM-INF:BANDWIDTH=401500,RESOLUTION=1920x1080,CODECS="avc1.640029"')
  })

  it('should correctly find the first variant source', () => {
    expect(example[3].type).toBe(M3u8LineType.VARIANT_SRC)
    expect(example[3].content).toBe('1920x1080-365kbps.m3u8')
  })

  it('should correctly find the second variant', () => {
    expect(example[4].type).toBe(M3u8LineType.VARIANT_META)
    expect(example[4].content).toBe('#EXT-X-STREAM-INF:BANDWIDTH=401500,RESOLUTION=640x360,CODECS="avc1.640029"')
  })

  it('should correctly find the second variant source', () => {
    expect(example[5].type).toBe(M3u8LineType.VARIANT_SRC)
    expect(example[5].content).toBe('640x360-365kbps.m3u8')
    expect(m3u8.variants[0]).toBe('1920x1080-365kbps.m3u8')
    expect(m3u8.variants[1]).toBe('640x360-365kbps.m3u8')
  })

  it('should find a total of 2 variants', () => {
    expect(example.filter(line => line.type === M3u8LineType.VARIANT_META).length).toBe(2)
    expect(m3u8.variants.length).toBe(2)
  })
})
