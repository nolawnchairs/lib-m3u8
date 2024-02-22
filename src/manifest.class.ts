
import { M3u8Tag } from './enums/m3u8-tag.enum'
import { IM3u8Line } from './interfaces/m3u8-line.interface'
import { IM3u8Producer } from './interfaces/m3u8-producer.interface'
import { IM3u8Variant } from './interfaces/m3u8-variant.interface'

export type VariantModifier = (variant: IM3u8Variant) => IM3u8Variant
export type VariantPredicate = (variant: IM3u8Variant) => boolean

export class Manifest implements IM3u8Producer {

  constructor(
    readonly meta: IM3u8Line[],
    readonly variants: IM3u8Variant[]) { }

  /**
   * Create a new master manifest with each variant
   * modified by the given modifier function
   *
   * @param {VariantModifier} modifier the function to apply to each variant
   * @return {*}  {Manifest}
   * @memberof Manifest
   */
  modifyEachVariant(modifier: VariantModifier): Manifest {
    const modified = this.variants.map(modifier)
    return new Manifest(this.meta, modified)
  }

  /**
   * Create a new master manifest with each variant
   * filtered by the given predicate function
   *
   * @param {VariantPredicate} predicate the function to apply to each variant
   * @return {*}  {Manifest}
   * @memberof Manifest
   */
  filterVariants(predicate: VariantPredicate): Manifest {
    const filtered = this.variants.filter(predicate)
    return new Manifest(this.meta, filtered)
  }

  marshal(): string {
    return [
      M3u8Tag.EXT_M3U,
      ...this.meta.map(({ content }) => content),
      ...this.variants.map(({ meta, source }) => [...meta.map(({ content }) => content), source].join('\n')),
    ].join('\n').trim()
  }
}
