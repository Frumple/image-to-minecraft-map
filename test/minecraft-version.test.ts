import ApplicationContainer from '@elements/autonomous/containers/application-container';
import SettingsPanel from '@elements/autonomous/containers/settings-panel';
import UploadsPanel from '@elements/autonomous/containers/uploads-panel';
import UploadProgressPanel from '@elements/autonomous/containers/upload-progress-panel';

import CurrentContext from '@models/current-context';

import { expect, jest, test } from '@jest/globals';

// @ts-ignore
import jsdomAddFiles from 'jsdom-add-files';

let applicationContainer: ApplicationContainer;
let settingsPanel: SettingsPanel;
let uploadsPanel: UploadsPanel;

beforeAll(async () => {
  await CurrentContext.init();

  await ApplicationContainer.define();
  await SettingsPanel.define();
  await UploadsPanel.define();
  await UploadProgressPanel.define();
});

beforeEach(() => {
  applicationContainer = new ApplicationContainer();
  settingsPanel = new SettingsPanel();
  uploadsPanel = new UploadsPanel();

  document.body.appendChild(applicationContainer);
  applicationContainer.appendChild(uploadsPanel);
});

it('should trigger a click event on the file input when the "Choose Files" button is clicked', () => {
  let fileInputClickEvent = null;

  uploadsPanel.fileInput.addEventListener('click', (event) => {
    fileInputClickEvent = event;
  });

  uploadsPanel.chooseFilesButton.click();

  expect(fileInputClickEvent).not.toBeNull();
});

it('should create map NBT file with dimension as a short', async () => {
  // const blob = await fetchBlob('images/test/mrt-logo.png');
  // const file = new File([blob], 'mrt-logo.png');

  jsdomAddFiles(uploadsPanel.fileInput, ['images/test/mrt-logo.png']);

  const uploadProgressPanel = getUploadProgressPanel(uploadsPanel);

  // console.log(uploadProgressPanel.downloadFileLink.href);

  // mapFilenameHeading.textContent
  // statusHeading.textContent
  // downloadFileLink.href
  // downloadFileLink.download
  // downloadFileTextLink.href
  // downloadFileTextLink.download

  // TODO: Verify aspects of UploadProgressPanel
  // TODO: Verify auto-download?
});

function getUploadProgressPanel(uploadsPanel: UploadsPanel, index: number = 0): UploadProgressPanel {
  const panelList = uploadsPanel.uploadsContainer.getElementsByTagName('upload-progress-panel');
  const panel = panelList.item(index);

  if (panel === null) {
    throw new Error(`Could not get UploadProgressPanel at index ${index}`);
  }

  return panel as UploadProgressPanel;
}
