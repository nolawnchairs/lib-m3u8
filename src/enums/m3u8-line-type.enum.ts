
/**
 * Enumeration that discriminates the type/purpose/scope of a line in an M3U8 file.
 *
 * @export
 * @enum {string}
 */
export enum M3u8LineType {
  /**
   * The first line of any m3u8 file (EXT_M3U)
   */
  HEADER = 'HEADER',
  /**
   * Lines that contain metadata for the entire m3u8
   */
  META = 'META',
  /**
   * Lines that contain metadata for a single segment
   */
  SEGMENT_META = 'SEGMENT_META',
  /**
   * Lines that contain the source path for a single segment
   */
  SEGMENT_SRC = 'SEGMENT_SRC',
  /**
   * Lines that contain metadata for m3u8 variants
   */
  VARIANT_META = 'VARIANT_META',
  /**
   * Lines that contain the source path for m3u8 variants
   */
  VARIANT_SRC = 'VARIANT_SRC',
  /**
   * Final line of any m3u8 file (EXT_X_ENDLIST)
   */
  FOOTER = 'FOOTER',
  /**
   * Any line containing a tag that is not used by this library
   */
  UNUSED = 'UNUSED',
  /**
   * Any line containing a META tag that is specific to the Montage M3U8 spec
   */
  MONTAGE_META = 'MONTAGE_META',
}
