const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function generateIcons() {
  const sizes = [192, 512];
  const logoPath = path.join(__dirname, 'public', 'logo.png');
  const outputDir = path.join(__dirname, 'public', 'icons');

  try {
    await fs.mkdir(outputDir, { recursive: true });

    for (const size of sizes) {
      // Regular icon
      await sharp(logoPath)
        .resize(size, size)
        .toFile(path.join(outputDir, `manifest-icon-${size}.png`));

      // Maskable icon (with padding)
      await sharp(logoPath)
        .resize(Math.floor(size * 0.8), Math.floor(size * 0.8))
        .extend({
          top: Math.floor(size * 0.1),
          bottom: Math.floor(size * 0.1),
          left: Math.floor(size * 0.1),
          right: Math.floor(size * 0.1),
          background: { r: 79, g: 70, b: 229, alpha: 1 } // primary color
        })
        .toFile(path.join(outputDir, `manifest-icon-${size}.maskable.png`));
    }

    console.log('PWA icons generated successfully!');
  } catch (error) {
    console.error('Error generating PWA icons:', error);
  }
}

generateIcons();