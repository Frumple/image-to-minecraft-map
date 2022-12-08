# Image to Minecraft Map

### Live Demo: [https://frumple.github.io/image-to-minecraft-map][app]

A web application that converts images to Minecraft NBT map .dat files, allowing such images to be displayed in Minecraft.

## Features

- Drag-and-drop multiple image files.
- Supports various color difference algorithms: CompuPhase, Euclidean, DeltaE 1976 and 2000, and CMC 1986.
- Supports Floyd-Steinberg dithering.

## Future Improvements

- Upload image to multiple maps.
- Support SVG files.
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

## Credits

This application implements the ["CompuPhase" color difference algorithm][compuphase], provided under a [Creative Commons License][creativecommons].

## License

Image to Minecraft Map is licensed under the [MIT License][mit].

Image to Minecraft Map is not affiliated in any way with Mojang or Microsoft.

[app]: https://frumple.github.io/image-to-minecraft-map
[color.js]: https://colorjs.io/
[compuphase]: https://www.compuphase.com/cmetric.htm
[creativecommons]: https://creativecommons.org/licenses/by-sa/3.0/
[mit]: https://choosealicense.com/licenses/mit/
[nbt-ts]: https://github.com/janispritzkau/nbt-ts
[pako]: https://github.com/nodeca/pako
