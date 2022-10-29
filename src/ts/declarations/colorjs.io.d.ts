// TODO: This declaration file will no longer be necessary once color.js is updated to 0.4.1

declare module 'colorjs.io/dist/color.js'{
  class Color {
    constructor(...args);

    space: ColorSpace;
    alpha: number;
    coords: Coords;

    srgb: SpaceAccessor;

    distance: ToColorPrototype<typeof distance>;
  }

  export = Color;
}