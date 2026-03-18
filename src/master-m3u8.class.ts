
import { M3u8LineType } from './enums/m3u8-line-type.enum'
import { M3u8Type } from './enums/m3u8-type.enum'
import { IM3u8Line } from './interfaces/m3u8-line.interface'
import { IM3u8Variant } from './interfaces/m3u8-variant.interface'
import { M3u8 } from './m3u8.class'
import { Manifest, VariantResolver } from './manifest.class'
import { M3u8Parser } from './util/m3u8-parser.util'

export class MasterM3u8 extends M3u8 {

  /**
   * The media variants in the manifest
   *
   * @readonly
   * @type {IM3u8Variant[]}
   * @memberof MasterM3u8
   */
  readonly variants: IM3u8Variant[] = []

  readonly meta: IM3u8Line[] = []

  /**
   * @param {string} content the m3u8-formatted string
   * @throws {Error} if the content is not a valid master variant manifest
   * @memberof MasterM3u8
   */
  constructor(content: string) {
    super(M3u8Parser.parse(content, M3u8Type.MASTER))

    const variantLines = this.lines.filter((line) => [M3u8LineType.VARIANT_META, M3u8LineType.VARIANT_SRC].includes(line.type))
    const variantSourceIndicies = variantLines
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => line.type === M3u8LineType.VARIANT_SRC)
      .map(({ index }) => index)

    this.meta = this.lines.filter((line) => line.type === M3u8LineType.META)
    let lastIndex = 0
    while (this.variants.length < variantSourceIndicies.length) {
      const metaLines = variantLines.slice(lastIndex, variantSourceIndicies[this.variants.length])
      this.variants.push({
        meta: metaLines,
        source: variantLines[variantSourceIndicies[this.variants.length]].content,
      })
      lastIndex += metaLines.length + 1
    }
  }

  get content(): string {
    return this.asManifest().marshal()
  }

  /**
   * Create a new manifest from the master m3u8
   *
   * @return {*}  {Manifest}
   * @memberof MasterM3u8
   */
  asManifest(): Manifest {
    return new Manifest(this.meta, this.variants)
  }

  /**
   * Resolve the master m3u8 using the specified resolver
   *
   * @param {VariantResolver} resolver
   * @return {*}  {Manifest}
   * @memberof MasterM3u8
   */
  resolve(resolver: VariantResolver): Manifest {
    return this.asManifest()
      .modifyEachVariant(({ meta, source }) => ({ meta, source: resolver(source) }))
  }
}
