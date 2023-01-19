import BaseContainer from '@elements/autonomous/containers/base-container';

import MapPreview from '@elements/autonomous/hover/map-preview';
import { MAP_SIZE } from '@helpers/image-helpers';

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

  createMapPreviews(numberOfMapsHorizontal: number, numberOfMapsVertical: number) {
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

  async render(bitmap: ImageBitmap) {
    for (let x = 0; x < this.numberOfMapsHorizontal; x++) {
      for (let y = 0; y < this.numberOfMapsVertical; y++) {
        const bitmapPortion = await createImageBitmap(bitmap, x * MAP_SIZE, y * MAP_SIZE, MAP_SIZE, MAP_SIZE);
        this.mapPreviews[x][y].render(bitmapPortion);
      }
    }
  }
}