
# Lib M3U8

A library to parse and create variants of M3u8 manifest files.

## Installation

npm install `@knightinteractive/m3u8`

> **Note**: This is a private NPM library, so a valid API token must be provided to install. It is also a proprietary library, with the assumption that it is used exclusively with the **Montage** platform, assuming all opinions it imposes.

## Usage

Instantiate either a master or media manifest file with the string contents of a valid m3u8 file.

### Loading a master (variant manifest)

```ts
const contents = await fs.readFile('master.m3u8', { encoding: 'utf-8' })
const masterM3u8 = new MasterM3u8(contents)
```

### Obtaining variants

Access the variants from a master manifest. The `variants` accessor returns a string array containing the sources for all variants referenced in the manifest.

```ts
const variants = masterM3u8.variants
```

### Loading a variant

```ts
const contents = await fs.readFile(variants[0], { encoding: 'utf-8' })
const variantM3u8 = new MediaM3u8(contents)
```

### Generating slices

Any `MediaM3u8` variant can be sliced into smaller parts, which can be marshaled into either `EVENT` or `VOD` formats.

Create a new instance of `M3u8Slicer`, providing the source `MediaM3u8` instance, a `TargetResolver` and an optional timing ratio.

The `TargetResolver` is a class that takes two functional operators in its constructor that will be used to resolve the actual URL to the encryption key, and that of the actual media source, respectively.

```ts
const resolver = new TargetResolver(
  value => value.replace('encryption.key', '/path/to/this/encryption.key'),
  value => `https://example.com/${value}`
)

const slicer = new M3u8Slicer(variantM3u8, resolver)
```

Create a live slice, which will produce a manifest with the `#EXT-X-PLAYLIST-TYPE` as `EVENT`, and without the `#EXT-X-ENDLIST` line at the end. The method takes three parameters:

* The numeric value to set to the `#EXT-X-MEDIA-SEQUENCE` tag
* The starting segment index of the slice
* The number of segments to include

```ts
// The first 5 segments
const slice1 = slicer.toLiveSlice(0, 0, 5)

// The next 5 segments
const slice2 = slicer.toLiveSlice(1, 4, 5)
```

Create a VOD slice, which will produce a manifest with the `#EXT-X-PLAYLIST-TYPE` as `VOD`, and includes the `#EXT-X-ENDLIST` line at the end. The method takes two parameters:

* The starting segment index of the slice
* The number of segments to include

> The VOD slice will always include the `#EXT-X-MEDIA-SEQUENCE` tag with the value of `0`.

```ts
// Make a slice from the 10th segment with a length of 10 segments
const vodSlice = slicer.toVodSlice(9, 10)
```

Create a live transition slice, which will produce a manifest with the `#EXT-X-PLAYLIST-TYPE` as `EVENT`, and without the `#EXT-X-ENDLIST` line at the end, but will include part of a different manifest using the same indexing. The method takes three parameters:

* The numeric value to set to the `#EXT-X-MEDIA-SEQUENCE` tag
* The starting segment index of the slice
* The `M3u8Slicer` instance of the slice to which the transition will be made

> **Note**: This method assumes a slice of length `3`, since this is a library specific to the Montage platform

```ts
const nextSlicer = new M3u8Slicer(otherM3u8, resolver)
const transition = slice.toLiveTransitionSlice(0, 0, nextSlicer)
```

### Slices

The `M3u8Slice` objects include the following properties and methods:

Properties:
* **`meta`** - `IM3u8Line[]` - The metadata for this created manifest slice
* **`segments`** - `IM3u8MediaSegment[]` - The media segments
* **`offsetMillis`** - `number` - The start offset, in milliseconds, that represents the time offset since the start of the media, based on the `#EXT-X-TARGETDURATION` tag's value
* **`offsetSeconds`** - `number` - The start offset, in seconds, floored to an integer
* **`mediaExhausted`** - `boolean` - Whether the slice was created at the end of a manifest file

Methods:
* **`marshal`** - The method that converts the slice to an m3u8-formatted string
* **`appendDiscontinuity`** - appends another slice to this slice, adding an `#EXT-X-DISCONTINUITY` tag to the beginning of the appended slice.
* **`modifyMeta`** - modifies the value to a specific meta tag from the manifest head
* **`omitMeta`** - removes a specific meta tag from the manifest head
* **`modifyEachSegment`** - apply a modifier function to each segment in the manifest
* **`modifySegmentMeta`** - apply a modifier function to each segment's metadata
* **`omitSegmentMeta`** - remove a specific tag from each segment's metadata

> **Note**: appending a discontinuity will **mutate** the slice to which it's applied. The `modify` and `omit` methods will immutably create a new `M3u8Slice` instance.

```ts
const slicer1 = new M3u8Slicer(firstM3u8)
const slice1 = slicer.toLiveSlice(0, 0, 10)

const slicer2 = new M3u8Slicer(secondM3u8)
const slice2 = slicer.toLiveSlice(0, 0, 5)

// Append the 5 segments from the second slice into the first
slice1.appendDiscontinuity(slice2)

// Marshal the result
const composite = slice1.marshal()
```

> **Note**: Appending a discontinuity will work for both live and VOD slices.

## Full Example

```ts
const contents = await fs.readFile('master.m3u8', { encoding: 'utf-8' })
const masterM3u8 = new MasterM3u8(contents)

const resolver = new TargetResolver(
  value => value.replace('encryption.key', '/path/to/this/encryption.key'),
  value => `https://example.com/${value}`
)

for (const variant of masterM3u8.variants) {
  const variantContents = await fs.readFile(variant, { encoding: 'utf-8' })
  const variantM3u8 = new MediaM3u8(contents)
  const slicer = new M3u8Slicer(variantM3u8, resolver)

  const results = []

  let i = 0
  for (const segment of variantM3u8.segments) {
    const slice = slicer.toLiveSlice(i, i, 3)
    results.push(slice.marshal())
  }
}

```

