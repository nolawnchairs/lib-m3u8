
type Resolver = (originalValue: string) => string

export class TargetResolver {

  /**
   * @param {Resolver} resolveEncryptionKeyUrl operator that pipes the encryption key line to a custom URL
   * @param {Resolver} resolveSourcePathUrl operator that pipes segment source values to a custom URL
   * @memberof TargetResolver
   */
  constructor(
    readonly resolveEncryptionKeyUrl: Resolver,
    readonly resolveSourcePathUrl: Resolver
  ) { }

  /**
   * The default resolver that does not modify the original values
   *
   * @static
   * @return {*}  {TargetResolver}
   * @memberof TargetResolver
   */
  static default(): TargetResolver {
    return new TargetResolver(
      (originalValue: string) => originalValue,
      (originalValue: string) => originalValue
    )
  }
}
