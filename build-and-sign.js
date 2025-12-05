// Script para construir y firmar los instaladores
// Evita problemas con el winCodeSign de electron-builder

require('dotenv').config();
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Función para encontrar signtool.exe
function findSigntool() {
  const windowsKitsPath = "C:\\Program Files (x86)\\Windows Kits\\10\\bin";

  if (fs.existsSync(windowsKitsPath)) {
    try {
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
    } catch (err) {
      // Continuar
    }
  }

  const appCertKitPath = "C:\\Program Files (x86)\\Windows Kits\\10\\App Certification Kit\\signtool.exe";
  if (fs.existsSync(appCertKitPath)) {
    return `"${appCertKitPath}"`;
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

    console.log(`✅ Firmado exitosamente: ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al firmar ${path.basename(filePath)}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('  Construyendo instaladores - Cumplimiento Protocolo Down');
  console.log('='.repeat(60));

  // Verificar certificado y contraseña
  const certFile = process.env.CERT_FILE || path.join(__dirname, "codesign-cert.pfx");
  const certPassword = process.env.CERT_PASSWORD;

  let shouldSign = false;

  if (!fs.existsSync(certFile)) {
    console.warn('\n⚠️  Certificado no encontrado. Construyendo SIN firma...');
  } else if (!certPassword) {
    console.warn('\n⚠️  CERT_PASSWORD no configurada. Construyendo SIN firma...');
  } else {
    const signtool = findSigntool();
    if (!signtool) {
      console.warn('\n⚠️  signtool.exe no encontrado. Construyendo SIN firma...');
    } else {
      shouldSign = true;
      console.log('\n✅ Certificado y signtool encontrados. Se firmarán los archivos.');
    }
  }

  // Paso 1: Construir sin firma para evitar problemas con winCodeSign
  console.log('\n📦 Paso 1: Construyendo instaladores...\n');

  try {
    const buildEnv = {
      ...process.env,
      CSC_IDENTITY_AUTO_DISCOVERY: 'false',
      WIN_CSC_LINK: undefined,
      WIN_CSC_KEY_PASSWORD: undefined
    };

    execSync('npx electron-builder', {
      stdio: "inherit",
      env: buildEnv
    });
  } catch (error) {
    console.error('\n❌ Error al construir instaladores');
    process.exit(1);
  }

  // Paso 2: Firmar archivos si está configurado
  if (shouldSign) {
    console.log('\n🔏 Paso 2: Firmando instaladores...\n');

    const distPath = path.join(__dirname, 'dist');
    const signtool = findSigntool();

    // Buscar archivos .exe en dist
    const files = fs.readdirSync(distPath).filter(f => f.endsWith('.exe'));

    if (files.length === 0) {
      console.warn('⚠️  No se encontraron archivos .exe para firmar en dist/');
    } else {
      for (const file of files) {
        const filePath = path.join(distPath, file);
        signFile(filePath, signtool, certFile, certPassword);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Proceso completado!');
  console.log('📁 Los instaladores están en: dist/');
  console.log('='.repeat(60) + '\n');
}

main().catch(err => {
  console.error('\n❌ Error:', err);
  process.exit(1);
});
