import VersionLoader from '@loaders/version-loader';
import { encode, Byte, Int, Short } from 'nbt-ts';

export function encodeNbtMap(colorArray: Int8Array, minecraftVersion: string) {
  // Before Java Edition snapshot 20w21a, the dimension NBT field was a byte.
  // This byte could be set to 0 for overworld, -1 for nether, 1 for end, and any other value to represent a static image with no player pin.

  // From 20w21a onward, the dimension field became a string representing the resource location of the dimension.
  // This can be any string, as long as it begin with the prefix "minecraft:".
  const dimension = isDimensionString(minecraftVersion) ? 'minecraft:imagetominecraftmap' : new Byte(0);

  const nbtTree = {
    data: {
      colors: colorArray,
      dimension: dimension,
      locked: new Byte(1),
      height: new Short(128),
      scale: new Byte(0),
      trackingPosition: new Byte(0),
      unlimitedTracking: new Byte(0),
      width: new Short(128),
      xCenter: new Int(0),
      zCenter: new Int(0)
    }
  };

  return encode('root', nbtTree);
}

function isDimensionString(currentVersionKey: string) {
  const versionWhereDimensionBecameString = VersionLoader.javaVersions.get('20w21a');
  if (versionWhereDimensionBecameString === undefined) {
    throw new Error('20w21a is not defined in Java versions.')
  }

  const currentVersion = VersionLoader.javaVersions.get(currentVersionKey);
  if (currentVersion === undefined) {
    throw new Error(`${currentVersionKey} is not defined in Java versions.`);
  }

  return currentVersion.date >= versionWhereDimensionBecameString.date;
}