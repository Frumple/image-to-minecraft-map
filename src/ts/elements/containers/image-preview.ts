import BaseContainer from '@elements/containers/base-container';

import MapPreview from '@elements/hover/map-preview';
import { MAP_SIDE_LENGTH } from '@helpers/image-helpers';

export default class ImagePreview extends BaseContainer {
  static get elementName() { return 'image-preview'; }

  container: HTMLDivElement;

  numberOfMapsHorizontal!: number;
  numberOfMapsVertical!: number;
  mapPreviews: MapPreview[][];

  constructor() {
    super();

    this.container = this.getShadowElement('image-preview') as HTMLDivElement;
    this.mapPreviews = [];
  }

  initialize() {

  }

  createMapPreviews(numberOfMapsHorizontal: number, numberOfMapsVertical: number): void {
    this.numberOfMapsHorizontal = numberOfMapsHorizontal;
    this.numberOfMapsVertical = numberOfMapsVertical;

    this.container.style.setProperty('grid-template-columns', `repeat(${numberOfMapsHorizontal}, 1fr)`);

    for (let x = 0; x < numberOfMapsHorizontal; x++) {
      this.mapPreviews[x] = [];
    }

    for (let y = 0; y < numberOfMapsVertical; y++) {
      for (let x = 0; x < numberOfMapsHorizontal; x++) {
        const mapPreview = document.createElement('map-preview') as MapPreview;
        this.mapPreviews[x][y] = mapPreview;
        this.container.appendChild(mapPreview);
      }
    }
  }

  async render(bitmap: ImageBitmap): Promise<void> {
    for (let y = 0; y < this.numberOfMapsVertical; y++) {
      for (let x = 0; x < this.numberOfMapsHorizontal; x++) {
        const bitmapPortion = await createImageBitmap(bitmap, x * MAP_SIDE_LENGTH, y * MAP_SIDE_LENGTH, MAP_SIDE_LENGTH, MAP_SIDE_LENGTH);
        this.mapPreviews[x][y].render(bitmapPortion);
      }
    }
  }
}