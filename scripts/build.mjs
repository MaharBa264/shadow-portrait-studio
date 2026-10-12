import { mkdir, copyFile } from 'node:fs/promises';
import { join } from 'node:path';

const files = ['index.html', 'src/style.css', 'src/main.js', 'src/optics.js', 'src/generator-lines.js', 'src/connected-paths.js', 'src/voxel-mesh.js', 'src/mesh-view.js', 'src/optical-bench.js'];
for (const path of files) {
  const dest = join('dist', path);
  await mkdir(join('dist', path.split('/').slice(0, -1).join('/')), { recursive: true });
  await copyFile(path, dest);
}
console.log('Static site built in dist/');
