
import { IM3u8Line } from './m3u8-line.interface'

export interface IM3u8Variant {
  /**
   * An array of metadata lines germane to this variant
   *
   * @type {IM3u8Line[]}
   * @memberof IM3u8Variant
   */
  meta: IM3u8Line[]
  /**
   * The source URL of the variant
   *
   * @type {string}
   * @memberof IM3u8Variant
   */
  source: string
}
