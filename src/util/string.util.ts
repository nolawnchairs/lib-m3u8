
export namespace Strings {

  /**
   * Convert a string value to an int safely with a fallback value
   * if the parse result is NaN
   *
   * @export
   * @param {string} value the string to convert
   * @param {number} [fallback] optional fallback value
   * @return {*}  {(number | null)}
   */
  export function toInt(value: string, fallback?: number): number | null {
    const int = parseInt(value)
    return Number.isNaN(int)
      ? fallback ?? null
      : int
  }

  /**
   * Convert a string value to an int safely with a fallback value
   * if the parse result is NaN
   *
   * @export
   * @param {string} value the string to convert
   * @param {number} [fallback] optional fallback value
   * @return {*}  {(number | null)}
   */
  export function toFloat(value: string, fallback?: number): number | null {
    const float = parseFloat(value)
    return Number.isNaN(float)
      ? fallback ?? null
      : float
  }

}
