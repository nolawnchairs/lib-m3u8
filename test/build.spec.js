const {
  M3u8,
  M3u8LineType,
  M3u8Slice,
  M3u8Slicer,
  M3u8Tag,
  Manifest,
  MasterM3u8,
  MediaM3u8,
  TargetResolver,
} = require('..')

describe('ensure build is functioning', () => {

  it('should find all library exports as defined', () => {
    expect(M3u8).toBeDefined()
    expect(M3u8LineType).toBeDefined()
    expect(M3u8Slice).toBeDefined()
    expect(M3u8Slicer).toBeDefined()
    expect(M3u8Tag).toBeDefined()
    expect(Manifest).toBeDefined()
    expect(MasterM3u8).toBeDefined()
    expect(MediaM3u8).toBeDefined()
    expect(TargetResolver).toBeDefined()
  })
})
