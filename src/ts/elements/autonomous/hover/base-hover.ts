import AutonomousCustomElement from '@elements/autonomous/autonomous-custom-element';

export default abstract class BaseHover extends AutonomousCustomElement {
  static get subdirectory() { return 'hover'; }

  constructor() {
    super();
  }

  initialize() {

  }
}