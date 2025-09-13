const sharp = require('sharp');

// Create PWA icons
const sizes = [192, 512];
const outputBase = './public/icons/';

async function generateIcons() {
  const logo = Buffer.from(`
    <svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" rx="128" fill="#4F46E5"/>
      <path d="M144 256C144 194.752 194.752 144 256 144C317.248 144 368 194.752 368 256C368 317.248 317.248 368 256 368C194.752 368 144 317.248 144 256ZM256 184C216.784 184 184 216.784 184 256C184 295.216 216.784 328 256 328C295.216 328 328 295.216 328 256C328 216.784 295.216 184 256 184Z" fill="white"/>
      <circle cx="256" cy="256" r="32" fill="white"/>
    </svg>
  `);

  for (const size of sizes) {
    // Regular icon
    await sharp(logo)
      .resize(size, size)
      .toFile(`${outputBase}manifest-icon-${size}.png`);

    // Maskable icon with padding
    await sharp(logo)
      .resize(Math.floor(size * 0.8), Math.floor(size * 0.8))
      .extend({
        top: Math.floor(size * 0.1),
        bottom: Math.floor(size * 0.1),
        left: Math.floor(size * 0.1),
        right: Math.floor(size * 0.1),
        background: { r: 79, g: 70, b: 229, alpha: 1 }
      })
      .toFile(`${outputBase}manifest-icon-${size}.maskable.png`);
  }
}

generateIcons().catch(console.error);