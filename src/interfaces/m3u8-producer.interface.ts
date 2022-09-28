
/**
 * Represents a producer of M3U8 files that can marshal
 * its contents into a string.
 *
 * @export
 * @interface IM3u8Producer
 */
export interface IM3u8Producer {
  /**
   * Marshal the contents to an m3u8-formatted string
   *
   * @return {*}  {string}
   * @memberof IM3u8Producer
   */
  marshal(): string
}
