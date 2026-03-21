
import { M3u8LineType } from '../enums/m3u8-line-type.enum'
import { M3u8Tag } from '../enums/m3u8-tag.enum'
import { M3u8Type } from '../enums/m3u8-type.enum'
import { IM3u8KeyLine } from '../interfaces/m3u8-key-line.interface'
import { IM3u8Line } from '../interfaces/m3u8-line.interface'

export namespace M3u8Parser {

  const tagMappings: Record<M3u8Tag, M3u8LineType> = {
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
    [M3u8Tag.EXT_X_MONTAGE_SOURCE_SEQUENCE]: M3u8LineType.MONTAGE_META,
  }

  const metaTags = Object.keys(tagMappings).filter((key) => tagMappings[key] == M3u8LineType.META)
  const segmentMetaTags = Object.keys(tagMappings).filter((key) => tagMappings[key] == M3u8LineType.SEGMENT_META)
  const variantMetaTags = Object.keys(tagMappings).filter((key) => tagMappings[key] == M3u8LineType.VARIANT_META)

  /**
   * Parse the contents of an m3u8-formatted string into an array of m3u8 lines.
   *
   * @export
   * @param {string} contents the UTF-8 encoded contents of the m3u8 file
   * @param {M3u8Type} type the type of m3u8 file
   * @return {*}  {IM3u8Line[]}
   */
  export function parse(contents: string, type: M3u8Type): IM3u8Line[] {

    const lines = contents.split('\n').filter((line) => line.trim().length > 0)

    // Guard against attempting to parse a master playlist without the #EXT-X-STREAM-INF tag
    if (type === M3u8Type.MASTER) {
      if (!lines.some((line) => line.startsWith(M3u8Tag.EXT_X_STREAM_INF))) {
        throw new Error(`The provided content is not a master M3u8 playlist. (${M3u8Tag.EXT_X_STREAM_INF} tag not found)`)
      }
    }

    // Guard against attempting to parse a media playlist without the #EXTINF tag
    if (type === M3u8Type.MEDIA) {
      if (!lines.some((line) => line.startsWith(M3u8Tag.EXTINF))) {
        throw new Error(`The provided content is not a media M3u8 playlist. (${M3u8Tag.EXTINF} tag not found)`)
      }
    }

    const m3u8Lines: IM3u8Line[] = []
    for (let i = 0; i < lines.length; i++) {

      const line = lines[i]

      // Detect the header, should be the first
      if (line == M3u8Tag.EXT_M3U && i == 0) {
        m3u8Lines.push({ type: M3u8LineType.HEADER, content: line, ...parseContentLine(line) })
        continue
      }

      // Detect if a line is a meta tag
      if (~metaTags.findIndex((tag) => line.startsWith(tag))) {
        m3u8Lines.push({ type: M3u8LineType.META, content: line, ...parseContentLine(line) })
        continue
      }

      // Detect if a line is a segment meta tag
      if (~segmentMetaTags.findIndex((tag) => line.startsWith(tag))) {
        m3u8Lines.push({ type: M3u8LineType.SEGMENT_META, content: line, ...parseContentLine(line) })
        continue
      }

      // Detect if a line is a variant meta tag
      if (~variantMetaTags.findIndex((tag) => line.startsWith(tag))) {
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
        m3u8Lines.push({ type: M3u8LineType.VARIANT_SRC, content: line, value: line })
        continue
      }

      // Detect the footer, should be the last
      if (line == M3u8Tag.EXT_X_ENDLIST && i == lines.length - 1) {
        m3u8Lines.push({ type: M3u8LineType.FOOTER, content: line, value: line, tag: M3u8Tag.EXT_X_ENDLIST })
        continue
      }

      // Detect unused tags
      m3u8Lines.push({ type: M3u8LineType.UNUSED, content: line, value: line })
    }

    return m3u8Lines
  }

  function parseContentLine(line: string): Pick<IM3u8Line, 'tag' | 'value'> {
    const splitIndex = line.indexOf(':')
    // If the line doesn't contain a colon, it's a tag with no value
    if (splitIndex == -1) {
      const tag = line as M3u8Tag
      return { tag, value: undefined }
    }

    // Otherwise, split the line into a tag and value
    const tag = line.substring(0, splitIndex) as M3u8Tag
    const value = line.substring(splitIndex + 1)
    return { tag, value }
  }

  /**
   * Remove duplicate lines from an array of m3u8 lines, keeping the first encountered.
   *
   * @export
   * @param {IM3u8Line[]} lines the lines to deduplicate
   * @return {*}  {IM3u8Line[]}
   */
  export function uniqueLineByTag(lines: IM3u8Line[]): IM3u8Line[] {
    const seen = []
    return lines.filter((line) => {
      if (seen.includes(line.tag)) {
        return false
      }
      seen.push(line.tag)
      return true
    })
  }

  const specKeyAttributes = ['METHOD', 'URI', 'IV', 'KEYFORMAT', 'KEYFORMATVERSIONS']

  export function parseKeyLine(line: IM3u8Line): IM3u8KeyLine {
    if (line.tag !== M3u8Tag.EXT_X_KEY) {
      throw new Error(`Line ${line.content} is not a key line.`)
    }

    const attributes = line.value.split(',').reduce((acc, pair) => {
      const [key, value] = pair.split('=')
      if (specKeyAttributes.includes(key)) {
        acc[key] = value.replace(/"/g, '')
      }
      return acc
    }, {} as Record<string, string>)

    return {
      method: attributes['METHOD'],
      uri: attributes['URI'],
      iv: attributes['IV'],
      keyFormat: attributes['KEYFORMAT'],
      keyFormatVersions: attributes['KEYFORMATVERSIONS'],
    }
  }

  export function writeKeyLine(keyLine: IM3u8KeyLine): string {
    const attributes = []
    if (!keyLine.method || !keyLine.uri) {
      throw new Error('Key line must include at least \'method\' and \'uri\' attributes.')
    }
    attributes.push(`METHOD=${keyLine.method}`)
    attributes.push(`URI="${keyLine.uri}"`)
    if (keyLine.iv) {
      attributes.push(`IV=${keyLine.iv}`)
    }
    if (keyLine.keyFormat) {
      attributes.push(`KEYFORMAT="${keyLine.keyFormat}"`)
    }
    if (keyLine.keyFormatVersions) {
      attributes.push(`KEYFORMATVERSIONS="${keyLine.keyFormatVersions}"`)
    }
    return attributes.join(',')
  }
}
