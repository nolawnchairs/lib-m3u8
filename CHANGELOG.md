# 1.0.2 (Current)

* Added static `compose` method to the `M3u8Slicer` class.
* Improved segment marshaling algorithm

# 1.0.1

* Errors are now thrown if `MediaM3u8` is instantiated with a master (variant) m3u8 file, and vice-versa.
* Added `asSlice` instance method to the `MediaM3u8` class, which creates a formatted VOD playlist from the source.
* Added a default `TargetResolver` that does not change the original values.

## 1.0.0

Original release