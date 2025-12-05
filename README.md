# Cumplimiento Protocolo Down

Aplicación Electron para el cumplimiento del protocolo Down.

**Versión:** 1.4.0
**Autores:** Dr. Víctor Mora & Dr. Fabio Cotes
**Licencia:** MIT

## Instalación y Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm start
```

## Generar Instaladores

### Paso 1: Crear certificado autofirmado (Primera vez)

**Ejecutar como Administrador en PowerShell:**

```powershell
npm run create-cert
```

Esto generará:
- Certificado autofirmado en `codesign-cert.pfx`
- Contraseña para el certificado (anótala)

### Paso 2: Configurar contraseña del certificado

**Opción A - Variable de entorno (Recomendado):**

```cmd
set CERT_PASSWORD=tu_contraseña_aqui
npm run build
```

**Opción B - Archivo .env:**

Crea un archivo `.env` en la raíz:

```
CERT_PASSWORD=tu_contraseña_aqui
```

### Paso 3: Generar aplicación empaquetada y firmada

```bash
# Generar aplicación empaquetada y firmada (Recomendado)
npm run build
```

La aplicación se generará en la carpeta `release/Cumplimiento Protocolo Down-win32-x64/`:
- `Cumplimiento Protocolo Down.exe` (Aplicación firmada digitalmente)
- Todos los archivos necesarios para ejecutar la aplicación

**Nota:** Esta carpeta completa puede ser distribuida directamente o comprimida en un archivo ZIP para distribución.

## Notas Importantes

### Certificado Autofirmado

⚠️ **El certificado autofirmado causará advertencias de seguridad en Windows** porque no está emitido por una Autoridad de Certificación (CA) confiable.

- **Para uso interno/desarrollo:** El certificado autofirmado es suficiente
- **Para distribución pública:** Se recomienda adquirir un certificado de firma de código comercial

### Windows SmartScreen

Windows SmartScreen puede mostrar advertencias:
- **Certificado autofirmado:** Siempre mostrará advertencia
- **Certificado comercial:** Mostrará advertencia hasta que la aplicación gane reputación
- **Certificado EV (Extended Validation):** Sin advertencias inmediatas

### Seguridad del Certificado

🔒 **NO COMPARTAS:**
- El archivo `codesign-cert.pfx`
- La contraseña del certificado
- El archivo `.env` si contiene la contraseña

Estos archivos están excluidos en `.gitignore` por seguridad.

## Estructura del Proyecto

```
ProtocoloDown/
├── main.js              # Proceso principal de Electron
├── preload.js           # Script de preload
├── sign.js              # Script de firma digital
├── create-cert.ps1      # Script para crear certificado
├── package.json         # Configuración del proyecto
├── LICENSE              # Licencia MIT
├── src/                 # Archivos HTML de la aplicación
├── dist/                # Instaladores generados (ignorado en git)
└── codesign-cert.pfx    # Certificado (ignorado en git)
```

## Licencia

MIT License - Ver archivo [LICENSE](LICENSE) para más detalles.

**EL SOFTWARE SE PROPORCIONA "TAL CUAL", SIN GARANTÍA DE NINGÚN TIPO.**
