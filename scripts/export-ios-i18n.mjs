import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'ios/AapSC/Resources/Localizations');

fs.mkdirSync(outDir, { recursive: true });

for (const lang of ['en', 'nl', 'ru', 'tr']) {
  const mod = await import(path.join(root, 'lib/i18n', `${lang}.js`));
  const data = mod.default;
  fs.writeFileSync(path.join(outDir, `${lang}.json`), JSON.stringify(data));
  console.log(`${lang}: wrote ${path.join(outDir, `${lang}.json`)}`);
}
