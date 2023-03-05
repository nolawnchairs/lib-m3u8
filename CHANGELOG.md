# 1.2.3 (Current)

* Fixed parsing bug where a colon `:` in meta values would cause premature termination of the value. Parsing now only splits on the first occurrence of a colon.

# 1.2.2

* Added `M3u8Slicer#toClonedSlice` method that creates a cloned slice from a media m3u8 file

# 1.2.1

* Fixed bug with `M3u8Slice#modifyMeta` method where `content` property was passed to modifier function instead of `value`

# 1.2.0

* Added `Manifest` class for Master m3u8 editing and marshaling
* Added static `isMaster` and `isMedia` methods to the base `M3u8` class

---
# 1.1.1

* Added `insertMeta` method to the `M3u8Slice` class
* Added Montage-specific tags

# 1.1.0

* Added `isDvr` argument to `M3u8Slicer#toLiveSlice` method that will append the 'EVENT' playlist type
* Added immutable modifier methods to `M3u8Slice` class:
  * `modifyMeta` - modifies the value to a specific meta tag from the manifest head
  * `omitMeta` - removes a specific meta tag from the manifest head
  * `modifyEachSegment` apply a modifier function to each segment in the manifest
  * `modifySegmentMeta` - apply a modifier function to each segment's metadata
  * `omitSegmentMeta` - remove a specific tag from each segment's metadata
  
# 1.0.2

* Added static `compose` method to the `M3u8Slicer` class.
* Improved segment marshaling algorithm

# 1.0.1

* Errors are now thrown if `MediaM3u8` is instantiated with a master (variant) m3u8 file, and vice-versa.
* Added `asSlice` instance method to the `MediaM3u8` class, which creates a formatted VOD playlist from the source.
* Added a default `TargetResolver` that does not change the original values.

## 1.0.0

Original release