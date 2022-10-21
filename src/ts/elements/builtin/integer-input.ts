import { convertToInteger } from '@helpers/number-helpers';

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

      this.isInitialized = true;
    }
  }

  onInput() {
    let value = this.valueAsInt;
    const min = this.minAsInt;
    const max = this.maxAsInt;

    if (value !== null) {
      if (min !== null && value < min) {
        this.value = this.min;
      } else if (max !== null && value > max) {
        this.value = this.max;
      } else {
        // Eliminate leading zeroes from the inputted value
        this.value = value.toString();
      }
    } else {
      // TODO: Use validation instead of setting value automatically to minimum
      this.value = this.min;
    }
  }

  get valueAsInt() {
    return convertToInteger(this.value);
  }

  get minAsInt() {
    return convertToInteger(this.min);
  }

  get maxAsInt() {
    return convertToInteger(this.max);
  }
}