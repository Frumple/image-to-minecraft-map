import { convertStringToInteger } from '@helpers/number-helpers';

export default class IntegerInput extends HTMLInputElement {
  isInitialized: boolean = false;

  static async define() {
    const elementName = 'integer-input';
    if (customElements.get(elementName) === undefined) {
      customElements.define(elementName, this, { extends: 'input' });
    }
  }

  constructor() {
    super();
  }

  connectedCallback() {
    if (this.isConnected && ! this.isInitialized) {
      this.addEventListener('input', this.onInput);
      this.addEventListener('blur', this.onBlur);

      this.isInitialized = true;
    }
  }

  onInput = () => {
    let value = convertStringToInteger(this.value);
    const min = this.minAsInt;
    const max = this.maxAsInt;

    if (value !== null) {
      if (value < min) {
        // Force values lower than minimum to be minimum
        this.value = this.min;
      } else if (value > max) {
        // Force values higher than maximum to be maximum
        this.value = this.max;
      } else {
        // Eliminate leading zeroes from the inputted value
        this.value = value.toString();
      }
    }
  }

  onBlur = () => {
    const value = convertStringToInteger(this.value);
    if (value === null) {
      this.value = this.minAsInt.toString();
    }
  }

  set valueAsInt(value: number) {
    this.value = value.toString();
  }

  set minAsInt(min: number) {
    this.min = min.toString();
  }

  set maxAsInt(max: number) {
    this.max = max.toString();
  }

  get valueAsInt(): number {
    return convertStringToInteger(this.value) ?? this.minAsInt;
  }

  get minAsInt(): number {
    return convertStringToInteger(this.min) ?? 0;
  }

  get maxAsInt(): number {
    return convertStringToInteger(this.max) ?? 0;
  }
}