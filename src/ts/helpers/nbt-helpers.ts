import { MAP_SIDE_LENGTH, MAP_FULL_LENGTH } from '@helpers/image-helpers';
import { JavaVersion } from '@models/versions/java-version';
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

export function encodeNbtMap(colorArray: Int8Array, minecraftVersionId: string): Buffer {
  const minecraftVersion = VersionLoader.javaVersions.get(minecraftVersionId);
  if (minecraftVersion === undefined) {
    throw new Error(`${minecraftVersionId} is not a defined Java version.`);
  }

  // Before Java Edition snapshot 20w21a, the dimension NBT field was a byte.
  // This byte could be set to 0 for overworld, -1 for nether, 1 for end, and any other value to represent a static image with no player pin.

  // From 20w21a onward, the dimension field became a string representing the resource location of the dimension.
  // This can be any string, as long as it begin with the prefix "minecraft:".
  const dimension = isDimensionStringInThisVersion(minecraftVersion) ? 'minecraft:overworld' : new Byte(0);

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
    },
    DataVersion: new Int(minecraftVersion.dataVersion)
  };

  return encode('root', nbtTree);
}

function isDimensionStringInThisVersion(minecraftVersion: JavaVersion): boolean {
  const versionWhereDimensionBecameString = VersionLoader.javaVersions.get('20w21a');
  if (versionWhereDimensionBecameString === undefined) {
    throw new Error('20w21a is not a defined Java version.');
  }

  return minecraftVersion.dataVersion >= versionWhereDimensionBecameString.dataVersion
}