import { Readable } from 'stream';

export class BufferStream extends Readable {
  buffer: Buffer;
  constructor(buffer: Buffer) {
    super();
    this.buffer = buffer;
  }

  _read() {
    this.push(this.buffer);
    this.push(null);
  }
}
