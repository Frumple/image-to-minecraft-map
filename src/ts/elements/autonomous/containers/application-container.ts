import CustomAutonomousElement from "@elements/autonomous/custom-autonomous-element";

export default class ApplicationContainer extends CustomAutonomousElement {
  static get elementName() { return 'application-container' };

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
  }
}