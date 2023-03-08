import { FileSystemResponse } from './file-response.class';

export class SaveFileResponse extends FileSystemResponse {
  size: number;
  constructor(url: string, name: string, mimetype: string, size: number) {
    super(url, name, mimetype);
    this.size = size;
  }
}
