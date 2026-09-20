import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fse from 'fs-extra';

const topDir = import.meta.dirname;
const tinymceDir = path.dirname(fileURLToPath(import.meta.resolve('tinymce/package.json')));

fse.emptyDirSync(path.join(topDir, 'public', 'tinymce'));
fse.copySync(tinymceDir, path.join(topDir, 'public', 'tinymce'), { overwrite: true });
