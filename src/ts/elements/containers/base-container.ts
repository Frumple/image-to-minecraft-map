import AutonomousCustomElement from '@elements/autonomous-custom-element';

export default abstract class BaseContainer extends AutonomousCustomElement {
  static get subdirectory() { return 'containers'; }

  constructor() {
    super();
  }

  initialize() {

  }
}