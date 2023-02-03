# Image to Minecraft Map

### Live App (Chrome recommended): [https://frumple.github.io/image-to-minecraft-map][app]

### Quick Start Instructions: [https://github.com/Frumple/image-to-minecraft-map/wiki][wiki]

A web application that converts images to Minecraft NBT map .dat files, allowing such images to be displayed in Minecraft.

If you think you've discovered a bug, please report it as an [issue][issues]. Be sure to provide as much detail as possible including exact steps to reproduce, settings, image file, and browser used.

## Features

- Drag-and-drop multiple image files at once and process them simultaneously.
- Split an image into multiple maps arranged in a grid pattern, such as 2x2, 3x3, etc.
- Download maps as .dat files or a .zip file containing the .dat files.
- Supports various color difference algorithms: CompuPhase, Euclidean, DeltaE 1976 and 2000, and CMC 1984.
- Supports Floyd-Steinberg dithering.

## Known Issues

- Firefox: Scaling Quality is always "Pixelated" regardless of what is set. It is recommended to use Chrome instead for the time being.

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

## License

Image to Minecraft Map is licensed under the [MIT License][mit].

Image to Minecraft Map is not affiliated in any way with Mojang or Microsoft.

[app]: https://frumple.github.io/image-to-minecraft-map
[color.js]: https://colorjs.io/
[compuphase]: https://www.compuphase.com/cmetric.htm
[cc-by-sa-3]: https://creativecommons.org/licenses/by-sa/3.0/
[issues]: https://github.com/Frumple/image-to-minecraft-map/issues
[jszip]: https://github.com/Stuk/jszip
[mit]: https://choosealicense.com/licenses/mit/
[nbt-ts]: https://github.com/janispritzkau/nbt-ts
[pako]: https://github.com/nodeca/pako
[wiki]: https://github.com/Frumple/image-to-minecraft-map/wiki
