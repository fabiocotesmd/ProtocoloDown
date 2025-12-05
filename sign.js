// Script de firma digital para electron-builder
// Usa certificado autofirmado para desarrollo/distribución

exports.default = async function(configuration) {
  // Cargar variables de entorno desde .env
  require('dotenv').config();

  const { execSync } = require("child_process");
  const path = require("path");
  const fs = require("fs");

  // Función para encontrar signtool.exe
  function findSigntool() {
    // Primero intentar desde PATH
    try {
      execSync('where signtool', { stdio: 'pipe' });
      return 'signtool';
    } catch (e) {
      // No está en PATH, buscar en ubicaciones comunes de Windows SDK
    }

    // Buscar en Windows Kits
    const windowsKitsPath = "C:\\Program Files (x86)\\Windows Kits\\10\\bin";

    if (fs.existsSync(windowsKitsPath)) {
      try {
        // Obtener versiones disponibles
        const versions = fs.readdirSync(windowsKitsPath)
          .filter(v => v.match(/^\d+\.\d+\.\d+\.\d+$/))
          .sort()
          .reverse();

        // Buscar signtool.exe en la versión más reciente para x64
        for (const version of versions) {
          const signtoolPath = path.join(windowsKitsPath, version, "x64", "signtool.exe");
          if (fs.existsSync(signtoolPath)) {
            console.log(`   Usando: ${signtoolPath}`);
            return `"${signtoolPath}"`;
          }
        }
      } catch (err) {
        // Continuar con la búsqueda
      }
    }

    // Última opción: buscar en App Certification Kit
    const appCertKitPath = "C:\\Program Files (x86)\\Windows Kits\\10\\App Certification Kit\\signtool.exe";
    if (fs.existsSync(appCertKitPath)) {
      console.log(`   Usando: ${appCertKitPath}`);
      return `"${appCertKitPath}"`;
    }

    return null;
  }

  // Ruta del certificado (buscar en la raíz del proyecto)
  const certFile = process.env.CERT_FILE || path.join(__dirname, "codesign-cert.pfx");
  const certPassword = process.env.CERT_PASSWORD || "";

  // Verificar si existe el certificado
  if (!fs.existsSync(certFile)) {
    console.warn("⚠️  Certificado no encontrado en:", certFile);
    console.warn("⚠️  Ejecuta: npm run create-cert");
    console.warn("⚠️  Omitiendo firma digital...");
    return;
  }

  if (!certPassword) {
    console.warn("⚠️  CERT_PASSWORD no configurada.");
    console.warn("⚠️  Configura la variable de entorno o archivo .env");
    console.warn("⚠️  Omitiendo firma digital...");
    return;
  }

  // Buscar signtool
  const signtool = findSigntool();
  if (!signtool) {
    console.error("❌ signtool.exe no encontrado");
    console.warn("⚠️  Instala Windows SDK desde:");
    console.warn("⚠️  https://developer.microsoft.com/windows/downloads/windows-sdk/");
    console.warn("⚠️  Continuando sin firma...\n");
    return;
  }

  console.log(`\n🔏 Firmando digitalmente: ${path.basename(configuration.path)}`);
  console.log(`   Certificado: ${certFile}`);

  try {
    // Comando signtool de Windows SDK
    const signCommand = `${signtool} sign /f "${certFile}" /p "${certPassword}" /tr http://timestamp.digicert.com /td sha256 /fd sha256 /v "${configuration.path}"`;

    execSync(signCommand, {
      stdio: "inherit",
      windowsHide: true
    });

    console.log(`✅ Firma exitosa: ${path.basename(configuration.path)}\n`);

  } catch (error) {
    console.error(`❌ Error al firmar: ${error.message}`);
    console.warn("⚠️  Continuando sin firma...\n");
  }
};
