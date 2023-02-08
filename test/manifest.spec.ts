
import { MasterM3u8 } from '../src/master-m3u8.class'

const SPECIMEN = `
#EXTM3U
#EXT-X-VERSION:6

#EXT-X-STREAM-INF:BANDWIDTH=401500,RESOLUTION=1920x1080,CODECS="avc1.640029"
1920x1080-365kbps.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=401500,RESOLUTION=640x360,CODECS="avc1.640029"
640x360-365kbps.m3u8
`

describe('master manifest variants', () => {

  const master = new MasterM3u8(SPECIMEN)

  it('should remove unecessary lines', () => {
    expect(master.toString().split('\n').length).toBe(6)
  })

  it('should find all meta', () => {
    const manifest = master.asManifest()
    expect(manifest.meta.length).toBe(1)
    expect(manifest.meta[0].value).toBe('6')
  })

  it('should find all variants', () => {
    const manifest = master.asManifest()
    expect(manifest.variants.length).toBe(2)
  })

  it('should modify each variant source', () => {
    const manifest = master.asManifest()
    const modified = manifest.modifyEachVariant(({ source, meta }) => ({ meta, source: `http://example.com/${source}` }))
    expect(modified.variants[0].source).toBe('http://example.com/1920x1080-365kbps.m3u8')
    expect(modified.variants[0].meta[0].value).toBe('BANDWIDTH=401500,RESOLUTION=1920x1080,CODECS="avc1.640029"')
    expect(modified.variants[1].source).toBe('http://example.com/640x360-365kbps.m3u8')
    expect(modified.variants[1].meta[0].value).toBe('BANDWIDTH=401500,RESOLUTION=640x360,CODECS="avc1.640029"')
  })

  it('should filter variants', () => {
    const manifest = master.asManifest()
    const filtered = manifest.filterVariants(({ source }) => source.includes('360'))
    expect(filtered.variants.length).toBe(1)
    expect(filtered.variants[0].source).toBe('640x360-365kbps.m3u8')
    expect(filtered.variants[0].meta[0].value).toBe('BANDWIDTH=401500,RESOLUTION=640x360,CODECS="avc1.640029"')
  })
})
