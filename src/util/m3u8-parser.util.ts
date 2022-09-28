
import { M3u8LineType } from '../enums/m3u8-line-type'
import { M3u8Tag } from '../enums/m3u8-tag.enum'
import { IM3u8Line } from '../interfaces/m3u8-line.interface'

export namespace M3u8Parser {

  const TAGS_BY_TYPE: Record<M3u8Tag, M3u8LineType> = {
    [M3u8Tag.EXT_M3U]: M3u8LineType.HEADER,
    [M3u8Tag.EXT_X_VERSION]: M3u8LineType.META,
    [M3u8Tag.EXT_X_TARGETDURATION]: M3u8LineType.META,
    [M3u8Tag.EXT_X_MEDIA_SEQUENCE]: M3u8LineType.META,
    [M3u8Tag.EXT_X_DISCONTINUITY_SEQUENCE]: M3u8LineType.SEGMENT_META,
    [M3u8Tag.EXT_X_PROGRAM_DATE_TIME]: M3u8LineType.UNUSED,
    [M3u8Tag.EXT_X_ENDLIST]: M3u8LineType.FOOTER,
    [M3u8Tag.EXT_X_PLAYLIST_TYPE]: M3u8LineType.META,
    [M3u8Tag.EXT_X_I_FRAMES_ONLY]: M3u8LineType.META,
    [M3u8Tag.EXT_X_INDEPENDENT_SEGMENTS]: M3u8LineType.META,
    [M3u8Tag.EXT_X_START]: M3u8LineType.META,
    [M3u8Tag.EXT_X_MAP]: M3u8LineType.META,
    [M3u8Tag.EXT_X_I_FRAME_STREAM_INF]: M3u8LineType.META,
    [M3u8Tag.EXT_X_STREAM_INF]: M3u8LineType.VARIANT_META,
    [M3u8Tag.EXT_X_SESSION_DATA]: M3u8LineType.META,
    [M3u8Tag.EXT_X_SESSION_KEY]: M3u8LineType.META,
    [M3u8Tag.EXT_X_KEY]: M3u8LineType.SEGMENT_META,
    [M3u8Tag.EXT_X_BYTERANGE]: M3u8LineType.SEGMENT_META,
    [M3u8Tag.EXT_X_DISCONTINUITY]: M3u8LineType.SEGMENT_META,
    [M3u8Tag.EXT_X_PART]: M3u8LineType.UNUSED,
    [M3u8Tag.EXT_X_PART_INF]: M3u8LineType.UNUSED,
    [M3u8Tag.EXT_X_PRELOAD_HINT]: M3u8LineType.UNUSED,
    [M3u8Tag.EXT_X_SERVER_CONTROL]: M3u8LineType.UNUSED,
    [M3u8Tag.EXT_X_SKIP]: M3u8LineType.UNUSED,
    [M3u8Tag.EXT_X_SKIP_INF]: M3u8LineType.UNUSED,
    [M3u8Tag.EXT_X_MEDIA]: M3u8LineType.META,
    [M3u8Tag.EXTINF]: M3u8LineType.SEGMENT_META,
  }

  /**
   * Parse the contents of an m3u8-formatted string into an array of m3u8 lines.
   *
   * @export
   * @param {string} contents the UTF-8 encoded contents of the m3u8 file
   * @return {*}  {IM3u8Line[]}
   */
  export function parse(contents: string): IM3u8Line[] {

    const lines = contents.split('\n').filter(line => line.trim().length > 0)
    const m3u8Lines: IM3u8Line[] = []
    for (let i = 0; i < lines.length; i++) {

      const line = lines[i]

      // Detect the header, should be the first
      if (line == M3u8Tag.EXT_M3U && i == 0) {
        m3u8Lines.push({ type: M3u8LineType.HEADER, content: line, ...parseContentLine(line) })
        continue
      }

      // Detect if a line is a meta tag
      const metaTags = Object.keys(TAGS_BY_TYPE).filter(key => TAGS_BY_TYPE[key] == M3u8LineType.META)
      if (~metaTags.findIndex(tag => line.startsWith(tag))) {
        m3u8Lines.push({ type: M3u8LineType.META, content: line, ...parseContentLine(line) })
        continue
      }

      // Detect if a line is a segment meta tag
      const segmentMetaTags = Object.keys(TAGS_BY_TYPE).filter(key => TAGS_BY_TYPE[key] == M3u8LineType.SEGMENT_META)
      if (~segmentMetaTags.findIndex(tag => line.startsWith(tag))) {
        m3u8Lines.push({ type: M3u8LineType.SEGMENT_META, content: line, ...parseContentLine(line) })
        continue
      }

      // Detect if a line is a variant meta tag
      const variantMetaTags = Object.keys(TAGS_BY_TYPE).filter(key => TAGS_BY_TYPE[key] == M3u8LineType.VARIANT_META)
      if (~variantMetaTags.findIndex(tag => line.startsWith(tag))) {
        m3u8Lines.push({ type: M3u8LineType.VARIANT_META, content: line, ...parseContentLine(line) })
        continue
      }

      // Detect if a line is a segment source, by checking if the previous line is a segment meta tag
      if (i > 1 && m3u8Lines[i - 1]?.type == M3u8LineType.SEGMENT_META) {
        m3u8Lines.push({ type: M3u8LineType.SEGMENT_SRC, content: line, value: line })
        continue
      }

      // Detect if a line is a variant source, by checking if the previous line is a variant meta tag
      if (i > 1 && m3u8Lines[i - 1]?.type == M3u8LineType.VARIANT_META) {
        m3u8Lines.push({ type: M3u8LineType.VARIANT_SRC, content: line, ...parseContentLine(line) })
        continue
      }

      // Detect the footer, should be the last
      if (line == M3u8Tag.EXT_X_ENDLIST && i == lines.length - 1) {
        m3u8Lines.push({ type: M3u8LineType.FOOTER, content: line, value: line })
        continue
      }

      // Detect unused tags
      m3u8Lines.push({ type: M3u8LineType.UNUSED, content: line, value: line })
    }

    return m3u8Lines
  }

  function parseContentLine(line: string): Pick<IM3u8Line, 'tag' | 'value'> {
    const [tag, value] = line.split(':') as [M3u8Tag, string]
    return { tag, value }
  }
}
