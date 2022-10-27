declare module 'colorjs.io/dist/color.js'{
  class Color {
    constructor(...args);

    space: ColorSpace;
    alpha: number;
    coords: Coords;

    srgb: SpaceAccessor;
  }

  export = Color;
}