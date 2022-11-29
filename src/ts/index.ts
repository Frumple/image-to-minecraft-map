import ApplicationContainer from '@elements/autonomous/containers/application-container';
import TopPanel from '@elements/autonomous/containers/top-panel';
import SettingsPanel from '@elements/autonomous/containers/settings-panel';
import UploadsPanel from '@elements/autonomous/containers/uploads-panel';
import UploadProgressPanel from '@elements/autonomous/containers/upload-progress-panel';

import IntegerInput from '@elements/builtin/integer-input';

import CurrentContext from '@models/current-context';

async function init() {
  CurrentContext.init();
  await defineElements();
}

async function defineElements() {
  const elementClasses = [
    ApplicationContainer,
    TopPanel,
    SettingsPanel,
    UploadsPanel,
    UploadProgressPanel,

    IntegerInput
  ];

  for (const elementClass of elementClasses) {
    await elementClass.define();
  }
}

init();