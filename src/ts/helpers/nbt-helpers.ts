import { encode, Byte, Int } from 'nbt-ts';

export function encodeNbtMap(colorArray: Int8Array) {
  const nbtTree = {
    data: {
      colors: colorArray,
      // TODO: For versions < 1.16, dimension is a byte
      dimension: 'imagetominecraftmap',
      locked: new Byte(1),
      scale: new Byte(0),
      trackingPosition: new Byte(0),
      unlimitedTracking: new Byte(0),
      xCenter: new Int(0),
      zCenter: new Int(0)
    }
  };

  return encode('root', nbtTree);
}