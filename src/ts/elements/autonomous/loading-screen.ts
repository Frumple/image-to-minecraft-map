import AutonomousCustomElement from './autonomous-custom-element';

const hiddenClass = 'loading-screen_hidden';

export default class LoadingScreen extends AutonomousCustomElement {
  static get elementName() { return 'loading-screen'; }

  container: HTMLDivElement;

  constructor() {
    super();

    this.container = this.getShadowElement('container') as HTMLDivElement;
  }

  set visible(isVisible: boolean) {
    if(isVisible) {
      this.container.classList.remove(hiddenClass);
    } else {
      this.container.classList.add(hiddenClass);
    }
  }

  get visible() {
    return ! this.container.classList.contains(hiddenClass);
  }
}