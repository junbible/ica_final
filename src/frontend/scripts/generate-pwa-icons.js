import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicDir = join(__dirname, '../public');
const logoPath = join(publicDir, 'logo.png');

const sizes = [192, 512];

async function generateIcons() {
  for (const size of sizes) {
    await sharp(logoPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 253, b: 245, alpha: 1 } // #FFFDF5
      })
      .png()
      .toFile(join(publicDir, `pwa-${size}x${size}.png`));

    console.log(`Generated pwa-${size}x${size}.png`);
  }

  // Apple touch icon
  await sharp(logoPath)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 255, g: 253, b: 245, alpha: 1 }
    })
    .png()
    .toFile(join(publicDir, 'apple-touch-icon.png'));

  console.log('Generated apple-touch-icon.png');
  console.log('Done!');
}

generateIcons().catch(console.error);
