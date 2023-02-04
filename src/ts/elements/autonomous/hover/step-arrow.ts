import BaseHover from '@elements/autonomous/hover/base-hover';

export default class StepArrow extends BaseHover {
  settingsGrid: HTMLDivElement;

  static get elementName() { return 'step-arrow'; }

  constructor() {
    super();

    this.settingsGrid = this.getShadowElement('settings-grid') as HTMLDivElement;
  }

  initialize() {

  }

  addSetting(settingName: string, settingValue: string): void {
    const settingNameElement = document.createElement('span');
    settingNameElement.classList.add('step-arrow__setting-name');
    settingNameElement.textContent = `${settingName}:`;
    this.settingsGrid.appendChild(settingNameElement);

    const settingValueElement = document.createElement('span');
    settingValueElement.classList.add('step-arrow__setting-value');
    settingValueElement.textContent = settingValue;
    this.settingsGrid.appendChild(settingValueElement);
  }
}