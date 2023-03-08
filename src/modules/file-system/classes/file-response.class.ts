export class FileSystemResponse {
  url: string;
  name: string;
  mimetype: string;

  constructor(url: string, name: string, mimetype: string) {
    this.url = url;
    this.name = name;
    this.mimetype = mimetype;
  }
}
