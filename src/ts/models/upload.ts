import { UploadedImage } from '@helpers/file-helpers';
import UploadProgressPanel from '@elements/autonomous/containers/upload-progress-panel';

export default class Upload {
  uploadedImage: UploadedImage;
  uploadProgressPanel: UploadProgressPanel;

  constructor(uploadedImage: UploadedImage, uploadProgressPanel: UploadProgressPanel) {
    this.uploadedImage = uploadedImage;
    this.uploadProgressPanel = uploadProgressPanel;
  }
}