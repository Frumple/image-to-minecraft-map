# Image to Minecraft Map

A web application that converts images to Minecraft NBT map .dat files, allowing such images to be displayed in Minecraft.

![photos-app](https://user-images.githubusercontent.com/68396/216803044-6cf1b116-d99d-4b95-818a-d7f8da15497a.png)
![photos-minecraft](https://user-images.githubusercontent.com/68396/216803198-c1311fcb-5a41-4781-8e41-a3b2a7d8a35a.png)

## How to Use

### Live Application: [https://frumple.github.io/image-to-minecraft-map][app]

**Chrome and Edge are recommended.** Firefox has a known issue (see below). Safari is not currently supported.

### Quick Start Instructions: [https://github.com/Frumple/image-to-minecraft-map/wiki][wiki]

## Features

- Drag-and-drop multiple image files at once and process them simultaneously.
- Split an image into multiple maps horizontally and vertically, into grid patterns such as 2x2, 3x3, etc.
- Download maps as .dat files, or a .zip file containing the .dat files.
- Supports various color difference algorithms: CompuPhase, Euclidean, DeltaE 1976 and 2000, and CMC 1984.
- Supports Floyd-Steinberg dithering.

## Known Issues

- Firefox: Scaling Quality always appears as "Pixelated" regardless of what is set.

## Future Improvements

- Support Bedrock Edition.
- Support additional dithering algorithms.

## Development Setup

Install all dependencies:

    yarn install

Start the development server:

    yarn start

## Dependencies

- [color.js][color.js] - Calculates color difference.
- [nbt-ts][nbt-ts] - Encodes data to the NBT format.
- [pako][pako] - Compresses NBT files using gzip.
- [jszip][jszip] - Creates zip files for download.

## Credits

This application implements the ["CompuPhase" color difference algorithm][compuphase], provided under the [Creative Commons BY-SA 3.0 License][cc-by-sa-3].

Sample images used in this README:
- "Rainbow-Lorikeet-1" by "John" at https://www.flickr.com/photos/34534185@N00/9004576204, available under the [Creative Commons BY-SA 2.0 License][cc-by-sa-2].
- "Rubber Duck in Seoul" by "travel oriented" at https://www.flickr.com/photos/99958070@N02/15348035017, available under the [Creative Commons BY-SA 2.0 License][cc-by-sa-2].

## License

Image to Minecraft Map is licensed under the [MIT License][mit].

Image to Minecraft Map is not affiliated in any way with Mojang or Microsoft.

[app]: https://frumple.github.io/image-to-minecraft-map
[cc-by-sa-2]: https://creativecommons.org/licenses/by-sa/2.0/
[cc-by-sa-3]: https://creativecommons.org/licenses/by-sa/3.0/
[color.js]: https://colorjs.io/
[compuphase]: https://www.compuphase.com/cmetric.htm
[issues]: https://github.com/Frumple/image-to-minecraft-map/issues
[jszip]: https://github.com/Stuk/jszip
[mit]: https://choosealicense.com/licenses/mit/
[nbt-ts]: https://github.com/janispritzkau/nbt-ts
[pako]: https://github.com/nodeca/pako
[wiki]: https://github.com/Frumple/image-to-minecraft-map/wiki
