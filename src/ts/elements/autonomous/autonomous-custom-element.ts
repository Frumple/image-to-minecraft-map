import { fetchText } from '@helpers/file-helpers';

export default class AutonomousCustomElement extends HTMLElement {
  private static htmlContent = '';
  private isInitialized = false;

  static get elementName(): string {
    throw new Error(`The class '${this.name}' must implement the elementName getter.`);
  }

  static get subdirectory(): string {
    return '';
  }

  private static get htmlPath(): string {
    return `elements/autonomous/${this.subdirectory}/${this.elementName}.html`;
  }

  static async define() {
    if (customElements.get(this.elementName) === undefined) {
      this.htmlContent = await fetchText(this.htmlPath);
      customElements.define(this.elementName, this);
    }
  }

  constructor() {
    super();

    this.attachShadow({mode: 'open'});
    const classConstructor = <typeof AutonomousCustomElement> this.constructor;
    const fragment = document.createRange().createContextualFragment(classConstructor.htmlContent);
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