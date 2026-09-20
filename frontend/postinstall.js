import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fse from 'fs-extra';

const topDir = import.meta.dirname;
// Resolved rather than joined onto node_modules directly: npm workspaces hoist
// shared dependencies to the repo root, so tinymce isn't reliably at
// frontend/node_modules/tinymce.
const tinymceDir = path.dirname(fileURLToPath(import.meta.resolve('tinymce/package.json')));

fse.emptyDirSync(path.join(topDir, 'public', 'tinymce'));
fse.copySync(tinymceDir, path.join(topDir, 'public', 'tinymce'), { overwrite: true });
