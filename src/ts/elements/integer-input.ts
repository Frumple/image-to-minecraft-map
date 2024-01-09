import AutonomousCustomElement from '@elements/autonomous-custom-element';

import { convertStringToInteger } from '@helpers/number-helpers';

export default class IntegerInput extends AutonomousCustomElement {
  static get elementName() { return 'integer-input'; }

  input: HTMLInputElement;

  constructor() {
    super();

    this.input = this.getShadowElement('input') as HTMLInputElement;
  }

  initialize() {
    this.addEventListener('input', this.onInput);
    this.addEventListener('blur', this.onBlur);
  }

  onInput = () => {
    const valueAsInt = convertStringToInteger(this.input.value);
    const minAsInt = this.min;
    const maxAsInt = this.max;

    if (valueAsInt !== null) {
      // Force values lower than minimum to be minimum
      if (valueAsInt < minAsInt) {
        this.input.value = minAsInt.toString();
      // Force values higher than maximum to be maximum
      } else if (valueAsInt > maxAsInt) {
        this.input.value = maxAsInt.toString();
      // Eliminate leading zeroes from the inputted value
      } else {
        this.input.value = valueAsInt.toString();
      }
    }
  }

  // Force null or blank values to be the minimum when input loses focus
  onBlur = () => {
    const valueAsInt = convertStringToInteger(this.input.value);
    if (valueAsInt === null) {
      this.input.value = this.min.toString();
    }
  }

  set type(type: string) {
    this.input.type = type;
  }

  set width(width: string) {
    this.input.style.width = width;
  }

  set value(value: number) {
    this.input.value = value.toString();
  }

  set min(min: number) {
    this.input.min = min.toString();
  }

  set max(max: number) {
    this.input.max = max.toString();
  }

  get type(): string {
    return this.input.type;
  }

  get width(): string {
    return this.input.style.width;
  }

  get value(): number {
    return convertStringToInteger(this.input.value) ?? this.min;
  }

  get min(): number {
    return convertStringToInteger(this.input.min) ?? 0;
  }

  get max(): number {
    return convertStringToInteger(this.input.max) ?? 0;
  }
}