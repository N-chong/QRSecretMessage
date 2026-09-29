import { Injectable } from '@angular/core';
import { Clipboard } from '@capacitor/clipboard';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

@Injectable({ providedIn: 'root' })
export class ShareService {
  copy(value: string): Promise<void> { return Clipboard.write({ string: value }); }

  async saveQr(dataUrl: string, name = `qrsecure-${Date.now()}.png`): Promise<string> {
    const base64 = dataUrl.split(',')[1];
    const result = await Filesystem.writeFile({ path: name, data: base64, directory: Directory.Documents });
    return result.uri;
  }

  async shareQr(dataUrl: string): Promise<void> {
    const uri = await this.saveQr(dataUrl);
    await Share.share({ title: 'QRSecure encrypted message', text: 'Encrypted QRSecure message. The password is shared separately.', files: [uri] });
  }
}
