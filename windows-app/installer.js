const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Paths
const assetsDir = path.join(__dirname, 'assets');
const iconsDir = path.join(assetsDir, 'icons');
const distDir = path.join(__dirname, 'dist');

// Create directories if they don't exist
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Function to convert SVG to multiple PNG sizes
async function convertSvgToPng(svgPath, outputPrefix) {
  // Icon sizes needed for Windows
  const sizes = [16, 24, 32, 48, 64, 128, 256];
  
  // Convert each size
  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `${outputPrefix}-${size}.png`);
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Created: ${outputPath}`);
  }
}

// Function to combine PNGs into an ICO file using ImageMagick
function createIcoFile(namePrefix, outputName) {
  const sizes = [16, 24, 32, 48, 64, 128, 256];
  const inputFiles = sizes.map(size => 
    path.join(iconsDir, `${namePrefix}-${size}.png`)
  ).join(' ');
  
  const outputIco = path.join(iconsDir, outputName);
  
  try {
    // Check if ImageMagick is installed (this will throw if not)
    execSync('magick --version', { stdio: 'ignore' });
    
    // Use ImageMagick to create ICO file
    execSync(`magick convert ${inputFiles} ${outputIco}`);
    console.log(`Created ICO file: ${outputIco}`);
  } catch (error) {
    console.error('Error creating ICO file:', error.message);
    console.error('Make sure ImageMagick is installed: https://imagemagick.org/');
  }
}

// Main function
async function main() {
  try {
    // Check if SVG files exist
    const appSvgPath = path.join(iconsDir, 'icon.svg');
    const dbSvgPath = path.join(iconsDir, 'taskdb.svg');
    
    if (!fs.existsSync(appSvgPath) || !fs.existsSync(dbSvgPath)) {
      console.error('SVG icon files not found. Make sure icon.svg and taskdb.svg exist in assets/icons/');
      process.exit(1);
    }
    
    // Convert SVGs to PNGs
    await convertSvgToPng(appSvgPath, 'app');
    await convertSvgToPng(dbSvgPath, 'db');
    
    // Create ICO files
    createIcoFile('app', 'icon.ico');
    createIcoFile('db', 'taskdb.ico');
    
    console.log('Icon generation completed!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

// Run the main function
main(); 