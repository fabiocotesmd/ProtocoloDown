// Script de prueba para verificar que signtool se encuentra correctamente

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

function findSigntool() {
  console.log("Buscando signtool.exe...\n");

  // Primero intentar desde PATH
  try {
    execSync('where signtool', { stdio: 'pipe' });
    console.log("✅ signtool encontrado en PATH del sistema");
    return 'signtool';
  } catch (e) {
    console.log("⏭️  signtool no está en PATH, buscando en Windows SDK...");
  }

  // Buscar en Windows Kits
  const windowsKitsPath = "C:\\Program Files (x86)\\Windows Kits\\10\\bin";

  if (fs.existsSync(windowsKitsPath)) {
    console.log(`✅ Directorio Windows SDK encontrado: ${windowsKitsPath}`);
    try {
      // Obtener versiones disponibles
      const versions = fs.readdirSync(windowsKitsPath)
        .filter(v => v.match(/^\d+\.\d+\.\d+\.\d+$/))
        .sort()
        .reverse();

      console.log(`   Versiones SDK disponibles: ${versions.join(', ')}`);

      // Buscar signtool.exe en la versión más reciente para x64
      for (const version of versions) {
        const signtoolPath = path.join(windowsKitsPath, version, "x64", "signtool.exe");
        console.log(`   Verificando: ${signtoolPath}`);
        if (fs.existsSync(signtoolPath)) {
          console.log(`✅ signtool.exe encontrado en: ${signtoolPath}`);
          return `"${signtoolPath}"`;
        }
      }
    } catch (err) {
      console.error(`❌ Error al buscar versiones: ${err.message}`);
    }
  } else {
    console.log(`❌ Directorio Windows SDK no encontrado: ${windowsKitsPath}`);
  }

  // Última opción: buscar en App Certification Kit
  const appCertKitPath = "C:\\Program Files (x86)\\Windows Kits\\10\\App Certification Kit\\signtool.exe";
  console.log(`   Verificando: ${appCertKitPath}`);
  if (fs.existsSync(appCertKitPath)) {
    console.log(`✅ signtool.exe encontrado en: ${appCertKitPath}`);
    return `"${appCertKitPath}"`;
  }

  return null;
}

// Ejecutar prueba
const signtool = findSigntool();

if (signtool) {
  console.log(`\n🎉 ¡Éxito! signtool está listo para usar.`);
  console.log(`\nPróximos pasos:`);
  console.log(`1. Ejecuta: npm run create-cert`);
  console.log(`2. Configura CERT_PASSWORD en .env`);
  console.log(`3. Ejecuta: npm run build`);
} else {
  console.error(`\n❌ signtool.exe no se encontró en ninguna ubicación conocida.`);
  console.log(`\nDebes instalar Windows SDK desde:`);
  console.log(`https://developer.microsoft.com/windows/downloads/windows-sdk/`);
}
