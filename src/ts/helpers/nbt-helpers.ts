import { MAP_SIDE_LENGTH, MAP_FULL_LENGTH } from '@helpers/image-helpers';
import VersionLoader from '@loaders/version-loader';

import { encode, Byte, Int, Short } from 'nbt-ts';

export function splitColorArrayIntoMaps(colorArray: Int8Array, numberOfMapsHorizontal: number, numberOfMapsVertical: number): Int8Array[][] {
  const splitArray: Int8Array[][] = [];

  for (let x = 0; x < numberOfMapsHorizontal; x++) {
    splitArray[x] = [];

    for (let y = 0; y < numberOfMapsVertical; y++) {
      splitArray[x][y] = new Int8Array(MAP_FULL_LENGTH);

      for (let row = 0; row < MAP_SIDE_LENGTH; row++) {
        const globalRowStartIndex = (y * numberOfMapsHorizontal * MAP_FULL_LENGTH) + (row * numberOfMapsHorizontal * MAP_SIDE_LENGTH) + (x * MAP_SIDE_LENGTH);
        const globalRowEndIndex = globalRowStartIndex + MAP_SIDE_LENGTH;
        const rowArray = colorArray.subarray(globalRowStartIndex, globalRowEndIndex);

        const localRowStartIndex = row * MAP_SIDE_LENGTH;
        splitArray[x][y].set(rowArray, localRowStartIndex);
      }
    }
  }

  return splitArray;
}

export function encodeNbtMap(colorArray: Int8Array, minecraftVersion: string): Buffer {
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