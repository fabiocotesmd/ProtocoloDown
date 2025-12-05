// Script simple de build usando solo electron-packager y firma manual
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
  console.log('  Cumplimiento Protocolo Down - Build Simple');
  console.log('='.repeat(60));

  // Paso 1: Usar electron-packager
  console.log('\n📦 Empaquetando aplicación con electron-packager...\n');

  try {
    execSync('npm run package', {
      stdio: "inherit"
    });
  } catch (error) {
    console.error('\n❌ Error al empaquetar');
    process.exit(1);
  }

  // Paso 2: Buscar el .exe generado y firmarlo
  const certFile = process.env.CERT_FILE || path.join(__dirname, "codesign-cert.pfx");
  const certPassword = process.env.CERT_PASSWORD;

  if (!fs.existsSync(certFile) || !certPassword) {
    console.log('\n⚠️  No se puede firmar: certificado o contraseña no encontrados');
    console.log('✅ Aplicación empaquetada en: release/');
    return;
  }

  const signtool = findSigntool();
  if (!signtool) {
    console.log('\n⚠️  No se puede firmar: signtool no encontrado');
    console.log('✅ Aplicación empaquetada en: release/');
    return;
  }

  // Buscar el ejecutable en release
  const releasePath = path.join(__dirname, 'release');
  const appDirs = fs.readdirSync(releasePath);

  for (const dir of appDirs) {
    const exePath = path.join(releasePath, dir, 'Cumplimiento Protocolo Down.exe');
    if (fs.existsSync(exePath)) {
      signFile(exePath, signtool, certFile, certPassword);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Proceso completado!');
  console.log('📁 Aplicación empaquetada en: release/');
  console.log('='.repeat(60) + '\n');
}

main().catch(err => {
  console.error('\n❌ Error:', err);
  process.exit(1);
});
