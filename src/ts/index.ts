import ApplicationContainer from "@elements/autonomous/containers/application-container";
import TopPanel from "@elements/autonomous/containers/top-panel";
import SettingsPanel from "@elements/autonomous/containers/settings-panel";
import UploadsPanel from "@elements/autonomous/containers/uploads-panel";
import UploadProgressPanel from "@elements/autonomous/containers/upload-progress-panel";


async function init() {
  await defineElements();
}

async function defineElements() {
  await ApplicationContainer.define();
  await TopPanel.define();
  await SettingsPanel.define();
  await UploadsPanel.define();
  await UploadProgressPanel.define();
}

init();