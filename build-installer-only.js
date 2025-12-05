// Script para crear instalador NSIS sin firma durante el build
require('dotenv').config();
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Función para encontrar signtool.exe
function findSigntool() {
  const windowsKitsPath = "C:\\Program Files (x86)\\Windows Kits\\10\\bin";

  if (fs.existsSync(windowsKitsPath)) {
    const versions = fs.readdirSync(windowsKitsPath)
      .filter(v => v.match(/^\d+\.\d+\.\d+\.\d+$/))
      .sort()
      .reverse();

    for (const version of versions) {
      const signtoolPath = path.join(windowsKitsPath, version, "x64", "signtool.exe");
      if (fs.existsSync(signtoolPath)) {
        return `"${signtoolPath}"`;
      }
    }
  }

  return null;
}

// Función para firmar un archivo
function signFile(filePath, signtool, certFile, certPassword) {
  console.log(`\n🔏 Firmando: ${path.basename(filePath)}`);

  try {
    const signCommand = `${signtool} sign /f "${certFile}" /p "${certPassword}" /tr http://timestamp.digicert.com /td sha256 /fd sha256 /v "${filePath}"`;

    execSync(signCommand, {
      stdio: "inherit",
      windowsHide: true
    });

    console.log(`✅ Firmado exitosamente`);
    return true;
  } catch (error) {
    console.error(`❌ Error al firmar:`, error.message);
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('  Construyendo Instalador NSIS');
  console.log('='.repeat(60));

  // Paso 1: Construir instalador sin firma
  console.log('\n📦 Generando instalador NSIS...\n');

  try {
    // Forzar electron-builder a NO intentar firmar
    const buildEnv = {
      ...process.env,
      CSC_IDENTITY_AUTO_DISCOVERY: 'false',
      WIN_CSC_LINK: '',
      WIN_CSC_KEY_PASSWORD: '',
      DEBUG: ''
    };

    // Eliminar variables de firma si existen
    delete buildEnv.WIN_CSC_LINK;
    delete buildEnv.WIN_CSC_KEY_PASSWORD;
    delete buildEnv.CSC_LINK;
    delete buildEnv.CSC_KEY_PASSWORD;

    execSync('npx electron-builder --win nsis --config.win.sign=null', {
      stdio: "inherit",
      env: buildEnv
    });

    console.log('\n✅ Instalador generado exitosamente');
  } catch (error) {
    console.error('\n❌ Error al construir instalador');
    process.exit(1);
  }

  // Paso 2: Firmar el instalador
  const certFile = process.env.CERT_FILE || path.join(__dirname, "codesign-cert.pfx");
  const certPassword = process.env.CERT_PASSWORD;

  if (!fs.existsSync(certFile) || !certPassword) {
    console.log('\n⚠️  Instalador creado sin firma digital');
    console.log('📁 Instalador en: dist/');
    return;
  }

  const signtool = findSigntool();
  if (!signtool) {
    console.log('\n⚠️  Instalador creado sin firma (signtool no encontrado)');
    console.log('📁 Instalador en: dist/');
    return;
  }

  // Buscar instalador en dist
  const distPath = path.join(__dirname, 'dist');
  if (!fs.existsSync(distPath)) {
    console.log('\n⚠️  No se encontró la carpeta dist/');
    return;
  }

  const files = fs.readdirSync(distPath).filter(f => f.endsWith('-setup.exe'));

  if (files.length === 0) {
    console.log('\n⚠️  No se encontró instalador en dist/');
  } else {
    console.log('\n🔏 Firmando instalador...');
    for (const file of files) {
      const filePath = path.join(distPath, file);
      signFile(filePath, signtool, certFile, certPassword);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Instalador completo!');
  console.log('📁 Ubicación: dist/');
  console.log('='.repeat(60) + '\n');
}

main().catch(err => {
  console.error('\n❌ Error:', err);
  process.exit(1);
});
