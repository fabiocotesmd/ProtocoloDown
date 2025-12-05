// Script para convertir PNG a ICO con tamaños adecuados para electron-builder
const pngToIco = require('png-to-ico');
const fs = require('fs');

async function createIcon() {
  try {
    console.log('Convirtiendo favicon.png a favicon.ico...');

    // Crear ICO con múltiples tamaños (16, 32, 48, 64, 128, 256)
    const buf = await pngToIco('favicon.png');

    fs.writeFileSync('favicon.ico', buf);

    console.log('✅ favicon.ico creado exitosamente con tamaños: 16, 32, 48, 64, 128, 256');
  } catch (err) {
    console.error('❌ Error al crear icono:', err);
    process.exit(1);
  }
}

createIcon();
