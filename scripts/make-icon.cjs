const sharp = require('sharp')
const path = require('path')

const svgPath = path.join(__dirname, 'icon-source.svg')
const outPath = path.join(__dirname, '..', 'build', 'icon.png')

sharp(svgPath)
  .resize(1024, 1024)
  .png()
  .toFile(outPath)
  .then(() => console.log('icon written to', outPath))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
