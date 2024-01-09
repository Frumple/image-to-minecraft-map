import ApplicationContainer from '@elements/containers/application-container';
import TopPanel from '@elements/containers/top-panel';
import SettingsPanel from '@elements/containers/settings-panel';
import UploadsPanel from '@elements/containers/uploads-panel';
import UploadProgressPanel from '@elements/containers/upload-progress-panel';
import ImagePreview from '@elements/containers/image-preview';
import DownloadBox from '@elements/containers/download-box';

import SettingsTooltip from '@elements/hover/settings-tooltip';
import MapPreview from '@elements/hover/map-preview';
import StepArrow from '@elements/hover/step-arrow';

import LoadingScreen from '@elements/loading-screen';
import IntegerInput from '@elements/integer-input';

import CurrentContext from '@models/current-context';

async function init() {
  CurrentContext.init();
  await defineElements();

  const loadingScreen = document.getElementById('loading-screen') as LoadingScreen;
  const applicationContainer = document.getElementById('application-container') as ApplicationContainer;

  applicationContainer.registerSettingsPanelEventListeners();

  await waitForBodyLoaded();

  applicationContainer.visible = true;
  loadingScreen.visible = false;
}

async function defineElements() {
  const elementClasses = [
    IntegerInput,

    ApplicationContainer,
    TopPanel,
    SettingsPanel,
    UploadsPanel,
    UploadProgressPanel,
    ImagePreview,
    DownloadBox,

    SettingsTooltip,
    MapPreview,
    StepArrow,

    LoadingScreen
  ];

  for (const elementClass of elementClasses) {
    await elementClass.define();
  }
}

async function waitForBodyLoaded(): Promise<void> {
  return new Promise((resolve) => {
    const intervalId = window.setInterval(checkBodyLoaded, 1000);

    function checkBodyLoaded() {
      if (document.getElementsByTagName('body')[0] !== undefined) {
        window.clearInterval(intervalId);
        resolve();
      }
    }
  });
}

init();