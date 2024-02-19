
/**
 * Serialization Protocol
 *
 * M3u8 Data is transmitted to downstream nodes in a serialized format:
 *
 * header1: value1
 * header2: value2
 * header3: value3
 * -----   (five dashes)
 * payload
 * \n\n    (two newlines separating the payload from the next header)
 *
 */

/**
 * Serialization Data Object
 */
export type SerializationData = {
  /**
   * The headers of the serialized data
   *
   * @type {Record<string, string>}
   */
  headers: Record<string, string>
  /**
   * The m3u8-formatted payload
   *
   * @type {string}
   */
  payload: string
}

export class SerializationCodec {
  /**
   * Serialize an array of M3u8 data into a string
   *
   * @param {SerializationData[]} data
   * @return {*}  {string}
   * @memberof SerializationCodec
   */
  serialize(data: SerializationData[]): string {
    const output = new Array<string>()
    for (const { headers, payload } of data) {
      const chunk = new Array<string>()
      for (const [header, value] of Object.entries(headers)) {
        chunk.push(`${header}: ${value}`)
      }
      chunk.push('-----')
      chunk.push(payload.trim())
      output.push(chunk.join('\n'))
    }
    return output.join('\n\n')
  }

  /**
   * Deserialize a string into an array of M3u8 data
   *
   * @param {string} raw
   * @return {*}  {SerializationData[]}
   * @memberof SerializationCodec
   */
  deserialize(raw: string): SerializationData[] {
    const chunks = raw.split('\n\n')
    const output = new Array<SerializationData>()
    for (const chunk of chunks) {
      const [rawHeaders, payload] = chunk.split('-----')
      const headers = rawHeaders.trim().split('\n').reduce((acc, header) => {
        const [key, value] = header.split(':')
        acc[key.trim()] = value.trim()
        return acc
      }, {})
      output.push({ headers, payload: payload.trim() })
    }
    return output
  }
}
