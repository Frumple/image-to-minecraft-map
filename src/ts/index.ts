import ApplicationContainer from '@elements/autonomous/containers/application-container';
import TopPanel from '@elements/autonomous/containers/top-panel';
import SettingsPanel from '@elements/autonomous/containers/settings-panel';
import UploadsPanel from '@elements/autonomous/containers/uploads-panel';
import UploadProgressPanel from '@elements/autonomous/containers/upload-progress-panel';

import ImagePreview from '@elements/autonomous/hover/image-preview';
import SettingsTooltip from '@elements/autonomous/hover/settings-tooltip';

import IntegerInput from '@elements/builtin/integer-input';

import CurrentContext from '@models/current-context';

async function init() {
  CurrentContext.init();
  await defineElements();
  registerSettingsPanelEventListeners();
}

async function defineElements() {
  const elementClasses = [
    ApplicationContainer,
    TopPanel,
    SettingsPanel,
    UploadsPanel,
    UploadProgressPanel,

    ImagePreview,
    SettingsTooltip,

    IntegerInput
  ];

  for (const elementClass of elementClasses) {
    await elementClass.define();
  }
}

function registerSettingsPanelEventListeners() {
  const applicationContainer = document.getElementById('application-container') as ApplicationContainer;
  applicationContainer.registerSettingsPanelEventListeners();
}

init();