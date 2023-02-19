import { FileSystemResponse } from './file-response.class';

export class SaveFileResponse extends FileSystemResponse {
  size: number;
  constructor(url: string, name: string, size: number) {
    super(url, name);
    this.size = size;
  }
}
