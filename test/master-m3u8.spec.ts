
import { MasterM3u8 } from '../src/master-m3u8.class'

const SPECIMEN = `
#EXTM3U
#EXT-X-VERSION:6
#EXT-X-STREAM-INF:BANDWIDTH=401500,RESOLUTION=1920x1080,CODECS="avc1.640029"
1920x1080-365kbps.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=401500,RESOLUTION=640x360,CODECS="avc1.640029"
640x360-365kbps.m3u8
`.trim()

const RESOLVED_SPECIMEN = `
#EXTM3U
#EXT-X-VERSION:6
#EXT-X-STREAM-INF:BANDWIDTH=401500,RESOLUTION=1920x1080,CODECS="avc1.640029"
https://example.com/1920x1080-365kbps.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=401500,RESOLUTION=640x360,CODECS="avc1.640029"
https://example.com/640x360-365kbps.m3u8
`.trim()

describe('master m3u8', () => {
  const master = new MasterM3u8(SPECIMEN)

  it('should parse to 6 lines', () => {
    expect(master.lines.length).toBe(6)
  })

  it('should find 2 variants', () => {
    expect(master.variants.length).toBe(2)
  })

  it('should correctly resolve the master m3u8', () => {
    const modifier = (source: string) => `https://example.com/${source}`
    const resolved = master.resolve(modifier).marshal()
    expect(resolved).toBe(RESOLVED_SPECIMEN)
  })
})
