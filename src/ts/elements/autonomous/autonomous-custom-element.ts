import { fetchFromFile } from '@helpers/file-helpers';
import { toKebabCase } from '@helpers/string-helpers';

export default class AutonomousCustomElement extends HTMLElement {
  private static htmlContent = '';

  private isInitialized = false;

  static get elementName(): string {
    throw new Error(`The class '${this.name}' must implement the elementName() getter.`);
  }

  static async define() {
    if (customElements.get(this.elementName) === undefined) {
      AutonomousCustomElement.htmlContent = await fetchFromFile(this.htmlPath);
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
    const fragment = document.createRange().createContextualFragment(AutonomousCustomElement.htmlContent);
    this.shadowRoot?.appendChild(fragment.cloneNode(true));
  }

  connectedCallback() {
    if (this.isConnected && ! this.isInitialized) {
      this.initialize();
      this.isInitialized = true;
    }
  }

  protected initialize() {
    // Implemented by subclasses
  }

  protected getShadowElement(id: string): Element {
    const element = this.shadowRoot?.getElementById(id) as Element;
    if (element === null) {
      throw new Error(`Could not find element with id '${id}'.`);
    }
    return element;
  }
}