const fs = require('fs');
const path = require('path');

/**
 * This script creates a very basic bitmap file for the NSIS installer sidebar
 * It creates a 164×314 bitmap with a blue gradient background and "Task Tracker" text
 * This is a very simple raw BMP file creator to avoid dependencies
 */

const installerDir = path.join(__dirname, 'assets', 'installer');

// Ensure the directory exists
if (!fs.existsSync(installerDir)) {
  fs.mkdirSync(installerDir, { recursive: true });
}

// BMP file dimensions - standard NSIS sidebar size
const width = 164;
const height = 314;

// Create a buffer for a 24-bit BMP file
// Header (54 bytes) + Pixel data (width * height * 3 bytes)
const fileSize = 54 + (width * height * 3);
const buffer = Buffer.alloc(fileSize);

// BMP file header (14 bytes)
buffer.write('BM', 0); // Signature
buffer.writeUInt32LE(fileSize, 2); // File size
buffer.writeUInt32LE(0, 6); // Reserved
buffer.writeUInt32LE(54, 10); // Offset to pixel data

// DIB header (40 bytes)
buffer.writeUInt32LE(40, 14); // DIB header size
buffer.writeInt32LE(width, 18); // Width
buffer.writeInt32LE(height, 22); // Height (negative for top-down)
buffer.writeUInt16LE(1, 26); // Color planes
buffer.writeUInt16LE(24, 28); // Bits per pixel (24 for RGB)
buffer.writeUInt32LE(0, 30); // No compression
buffer.writeUInt32LE(width * height * 3, 34); // Image size
buffer.writeInt32LE(2835, 38); // Horizontal resolution (72 DPI in pixels/meter)
buffer.writeInt32LE(2835, 42); // Vertical resolution
buffer.writeUInt32LE(0, 46); // No color palette
buffer.writeUInt32LE(0, 50); // All colors are important

// Pixel data - fill with gradient blue background
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const pos = 54 + (y * width + x) * 3;
    
    // Gradient from darker blue at top to lighter blue at bottom
    const blueValue = Math.floor(100 + (y / height) * 155);
    
    // In BMP, colors are stored as BGR
    buffer[pos] = 80;             // B
    buffer[pos + 1] = 80;         // G
    buffer[pos + 2] = blueValue;  // R
  }
}

// Write "TASK TRACKER" text in the middle by making some pixels white
// This is very simplistic - just a basic representation
const message = [
  "############### ",
  "#     #     ## ",
  "#     #     ## ",
  "#     #     ## ",
  "#############  ",
  "#     #     ## ",
  "#     #     ## ",
  "#     #     ## ",
  "               ",
  "############## ",
  "#      #     # ",
  "#      #     # ",
  "#      #     # ",
  "#############  ",
  "#      #     # ",
  "#      #     # ",
  "#      #     # ",
];

// Position the text
const textStartX = 20;
const textStartY = 100;

// Draw the message
for (let y = 0; y < message.length; y++) {
  for (let x = 0; x < message[y].length; x++) {
    if (message[y][x] === '#') {
      const posX = textStartX + x * 2;
      const posY = textStartY + y * 2;
      
      if (posX < width && posY < height) {
        const pos = 54 + ((height - 1 - posY) * width + posX) * 3;
        buffer[pos] = 255;     // B
        buffer[pos + 1] = 255; // G
        buffer[pos + 2] = 255; // R
      }
    }
  }
}

// Save the BMP file
fs.writeFileSync(path.join(installerDir, 'sidebar.bmp'), buffer);
console.log(`Created sidebar.bmp in ${installerDir}`);

// Create a placeholder taskdb.ico if it doesn't exist
const iconsDir = path.join(__dirname, 'assets', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const iconPath = path.join(iconsDir, 'taskdb.ico');
if (!fs.existsSync(iconPath)) {
  // Create a minimal 1×1 pixel ICO file
  const iconBuffer = Buffer.from([
    0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x10, 0x10, 
    0x00, 0x00, 0x01, 0x00, 0x04, 0x00, 0x28, 0x01, 
    0x00, 0x00, 0x16, 0x00, 0x00, 0x00, 0x28, 0x00, 
    0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x20, 0x00, 
    0x00, 0x00, 0x01, 0x00, 0x04, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 
    0x00, 0x00, 0xFF, 0x00, 0x00, 0xFF, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0xFF, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
  ]);
  
  fs.writeFileSync(iconPath, iconBuffer);
  console.log(`Created placeholder taskdb.ico in ${iconsDir}`);
  
  // Create icon.ico as well if it doesn't exist
  const appIconPath = path.join(iconsDir, 'icon.ico');
  if (!fs.existsSync(appIconPath)) {
    fs.copyFileSync(iconPath, appIconPath);
    console.log(`Created placeholder icon.ico in ${iconsDir}`);
  }
}

console.log('All installer assets generated successfully.');

// Add these to package.json script
console.log('\nAdd this to package.json scripts:');
console.log('"create-assets": "node create-installer-assets.js"');
console.log('Then run: npm run create-assets'); 