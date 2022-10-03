import { fetchFromFile } from '@helpers/file-helpers';
import { toKebabCase } from '@helpers/string-helpers';

export default class CustomAutonomousElement extends HTMLElement {
  private static htmlContent = '';

  static get elementName(): string {
    throw new Error(`The class '${this.name}' must implement the elementName() getter.`);
  }

  static async define() {
    if (customElements.get(this.elementName) === undefined) {
      CustomAutonomousElement.htmlContent = await fetchFromFile(this.htmlPath);
      customElements.define(this.elementName, this);
    }
  }

  static get htmlPath(): string {
    const kebab = toKebabCase(this.name);
    return `/elements/autonomous/containers/${kebab}.html`;
  }

  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    const fragment = document.createRange().createContextualFragment(CustomAutonomousElement.htmlContent);
    this.shadowRoot?.appendChild(fragment.cloneNode(true));
  }

  connectedCallback() {
    return;
  }
}