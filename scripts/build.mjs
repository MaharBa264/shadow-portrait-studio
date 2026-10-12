import { mkdir, copyFile } from 'node:fs/promises';
import { join } from 'node:path';

const files = ['index.html', 'src/style.css', 'src/main.js', 'src/optics.js'];
for (const path of files) {
  const dest = join('dist', path);
  await mkdir(join('dist', path.split('/').slice(0, -1).join('/')), { recursive: true });
  await copyFile(path, dest);
}
console.log('Static site built in dist/');
