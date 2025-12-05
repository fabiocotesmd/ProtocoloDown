const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

const { ipcMain } = require('electron');
const fs = require('fs');

function createWindow(htmlFile, options = {}) {
  const win = new BrowserWindow({
    width: 750,
    height: 800,
    autoHideMenuBar: htmlFile !== 'nuevo_informe.html',
    icon: path.join(__dirname, 'favicon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: true
    }
  });

  // Create menu for nuevo_informe window
  if (htmlFile === 'nuevo_informe.html') {
    const menuTemplate = [
      {
        label: 'Archivo',
        submenu: [
          {
            label: 'Imprimir',
            accelerator: 'CmdOrCtrl+P',
            click: () => {
              const printOptions = {
                silent: false,
                printBackground: true,
                color: true,
                margin: {
                  marginType: 'none'
                },
                landscape: false,
                pagesPerSheet: 1,
                collate: false,
                copies: 1
              };

              win.webContents.print(printOptions, (success, failureReason) => {
                if (!success) {
                  console.log('Print failed:', failureReason);
                }
              });
            }
          },
          {
            label: 'Vista previa de impresión',
            click: () => {
              const pdfOptions = {
                marginsType: 0, // Sin márgenes por defecto
                pageSize: 'A4',
                printBackground: true, // Forzar impresión de fondos
                printSelectionOnly: false,
                landscape: false,
                scaleFactor: 100
              };

              win.webContents.printToPDF(pdfOptions).then(data => {
                const fs = require('fs');
                const path = require('path');
                const { shell } = require('electron');
                const timestamp = new Date().toISOString().slice(0, 16).replace(/:/g, '-');
                const filePath = path.join(require('os').tmpdir(), `informe_protocolo_${timestamp}.pdf`);
                fs.writeFileSync(filePath, data);
                shell.openPath(filePath);
              }).catch(error => {
                console.error('Error generating PDF:', error);
                const { dialog } = require('electron');
                dialog.showErrorBox('Error de PDF', 'No se pudo generar el PDF: ' + error.message);
              });
            }
          },
          {
            label: 'Guardar PDF como...',
            click: async () => {
              const { dialog } = require('electron');
              const timestamp = new Date().toISOString().slice(0, 10);

              const result = await dialog.showSaveDialog(win, {
                title: 'Guardar informe como PDF',
                defaultPath: `Informe_Protocolo_${timestamp}.pdf`,
                filters: [
                  { name: 'PDF Files', extensions: ['pdf'] }
                ]
              });

              if (!result.canceled) {
                const pdfOptions = {
                  marginsType: 0,
                  pageSize: 'A4',
                  printBackground: true,
                  printSelectionOnly: false,
                  landscape: false,
                  scaleFactor: 100
                };

                win.webContents.printToPDF(pdfOptions).then(data => {
                  const fs = require('fs');
                  fs.writeFileSync(result.filePath, data);

                  const { shell } = require('electron');
                  shell.showItemInFolder(result.filePath);
                }).catch(error => {
                  console.error('Error generating PDF:', error);
                  dialog.showErrorBox('Error de PDF', 'No se pudo guardar el PDF: ' + error.message);
                });
              }
            }
          },
          { type: 'separator' },
          {
            label: 'Cerrar',
            accelerator: 'CmdOrCtrl+W',
            click: () => {
              win.close();
            }
          }
        ]
      },
      {
        label: 'Ver',
        submenu: [
          {
            label: 'Recargar',
            accelerator: 'CmdOrCtrl+R',
            click: () => {
              win.webContents.reload();
            }
          },
          {
            label: 'Herramientas de desarrollador',
            accelerator: 'F12',
            click: () => {
              win.webContents.toggleDevTools();
            }
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    win.setMenu(menu);
  }

  win.loadFile(path.join(__dirname, 'src', htmlFile));
}

// IPC handler para generar PDF directamente
ipcMain.handle('abrir-nuevo-informe', async (event) => {
  return new Promise((resolve, reject) => {
    // Crear ventana temporal invisible para generar PDF
    const tempWin = new BrowserWindow({
      width: 800,
      height: 600,
      show: false, // Ventana invisible
      icon: path.join(__dirname, 'favicon.png'),
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: true
      }
    });

    // Cargar el archivo HTML del informe
    tempWin.loadFile(path.join(__dirname, 'src', 'nuevo_informe.html'));

    // Esperar a que la página se cargue completamente
    tempWin.webContents.once('did-finish-load', async () => {
      try {
        // Esperar un poco más para asegurar que los datos se carguen
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Configuración de PDF actual
        const pdfOptions = {
          marginsType: 0,
          pageSize: 'A4',
          printBackground: true,
          printSelectionOnly: false,
          landscape: false,
          scaleFactor: 100
        };

        // Generar PDF
        const pdfData = await tempWin.webContents.printToPDF(pdfOptions);

        // Crear nombre de archivo con timestamp
        const timestamp = new Date().toISOString().slice(0, 16).replace(/:/g, '-');
        const filePath = path.join(require('os').tmpdir(), `Informe_Protocolo_${timestamp}.pdf`);

        // Guardar PDF
        const fs = require('fs');
        fs.writeFileSync(filePath, pdfData);

        // Abrir PDF con aplicación predeterminada
        const { shell } = require('electron');
        await shell.openPath(filePath);

        // Cerrar ventana temporal
        tempWin.close();

        resolve({ success: true, filePath });

      } catch (error) {
        console.error('Error generating PDF:', error);
        tempWin.close();
        reject(error);
      }
    });

    // Manejo de errores de carga
    tempWin.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Failed to load:', errorDescription);
      tempWin.close();
      reject(new Error(errorDescription));
    });
  });
});

app.whenReady().then(() => {
  // Mostrar ruta de registros para depuración
  const userDataPath = app.getPath('userData');
  const registrosDir = path.join(userDataPath, 'registros');
  console.log('Ruta de registros:', registrosDir);
  console.log('IPC handlers registrados:', [
    'guardar-registro',
    'actualizar-registro',
    'leer-registro',
    'listar-registros',
    'obtener-registro-disponible',
    'leer-archivo-html',
    'abrir-nuevo-informe',
    'open-external'
  ]);

  // Migrar registros al iniciar la aplicación
  migrarRegistrosIniciales();

  // Cambia el archivo HTML principal aquí
  createWindow('formulario_identificacion.html');

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow('formulario_identificacion.html');
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Función para migrar registros del directorio de desarrollo a UserData
function migrarRegistrosIniciales() {
  try {
    const userDataPath = app.getPath('userData');
    const registrosDir = path.join(userDataPath, 'registros');
    const oldRegistrosDir = path.join(__dirname, 'registros');

    // Crear carpeta de destino si no existe
    if (!fs.existsSync(registrosDir)) {
      fs.mkdirSync(registrosDir, { recursive: true });
    }

    // Verificar si ya hay archivos migrados
    const existingFiles = fs.existsSync(registrosDir) ? fs.readdirSync(registrosDir) : [];

    // Solo migrar si la carpeta origen existe y la de destino está vacía o con pocos archivos
    if (fs.existsSync(oldRegistrosDir) && existingFiles.length < 3) {
      const filesToMigrate = fs.readdirSync(oldRegistrosDir).filter(file => file.endsWith('.json'));

      filesToMigrate.forEach(file => {
        const oldPath = path.join(oldRegistrosDir, file);
        const newPath = path.join(registrosDir, file);

        // Solo copiar si el archivo no existe en destino
        if (!fs.existsSync(newPath)) {
          try {
            fs.copyFileSync(oldPath, newPath);
            console.log(`Registro migrado: ${file}`);
          } catch (copyError) {
            console.warn(`No se pudo migrar ${file}:`, copyError.message);
          }
        }
      });

      console.log('Migración de registros completada');
    }
  } catch (error) {
    console.warn('Error durante la migración de registros:', error.message);
  }
}

// IPC handlers para guardar y actualizar registros
ipcMain.handle('guardar-registro', async (event, registro, nombreArchivo) => {
  try {
    // Usar AppData para datos de usuario
    const userDataPath = app.getPath('userData');
    const registrosDir = path.join(userDataPath, 'registros');
    const filePath = path.join(registrosDir, nombreArchivo);
    const carpeta = path.dirname(filePath);

    // Verifica y crea la carpeta si no existe
    if (!fs.existsSync(carpeta)) {
      fs.mkdirSync(carpeta, { recursive: true });
    }

    // Verificar si el archivo ya existe para determinar si es actualización o creación
    const existe = fs.existsSync(filePath);

    await fs.promises.writeFile(filePath, JSON.stringify(registro, null, 2), 'utf8');

    return {
      success: true,
      filePath,
      operacion: existe ? 'actualizado' : 'creado'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('actualizar-registro', async (event, registro, rutaArchivo) => {
  try {
    // Usar AppData para datos de usuario
    const userDataPath = app.getPath('userData');
    const registrosDir = path.join(userDataPath, 'registros');
    const nombreArchivo = path.basename(rutaArchivo);
    const fullPath = path.join(registrosDir, nombreArchivo);

    // Verifica y crea la carpeta si no existe
    if (!fs.existsSync(registrosDir)) {
      fs.mkdirSync(registrosDir, { recursive: true });
    }

    await fs.promises.writeFile(fullPath, JSON.stringify(registro, null, 2), 'utf8');
    return { success: true, filePath: fullPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC handlers adicionales para manejo de registros
ipcMain.handle('leer-registro', async (event, nombreArchivo) => {
  try {
    const userDataPath = app.getPath('userData');
    const registrosDir = path.join(userDataPath, 'registros');
    const filePath = path.join(registrosDir, nombreArchivo);

    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      throw new Error(`El archivo ${nombreArchivo} no existe. Puede haber sido eliminado o movido.`);
    }

    const data = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('listar-registros', async (event) => {
  try {
    const userDataPath = app.getPath('userData');
    const registrosDir = path.join(userDataPath, 'registros');

    // Crear la carpeta si no existe
    if (!fs.existsSync(registrosDir)) {
      fs.mkdirSync(registrosDir, { recursive: true });
    }

    const files = await fs.promises.readdir(registrosDir);
    return files.filter(file => file.endsWith('.json'));
  } catch (error) {
    console.error('Error listando registros:', error);
    throw error;
  }
});

// IPC handler para obtener un registro específico basado en parámetros del usuario
ipcMain.handle('obtener-registro-disponible', async (event, parametrosBusqueda = null) => {
  try {
    const userDataPath = app.getPath('userData');
    const registrosDir = path.join(userDataPath, 'registros');

    // Crear la carpeta si no existe
    if (!fs.existsSync(registrosDir)) {
      fs.mkdirSync(registrosDir, { recursive: true });
    }

    const files = await fs.promises.readdir(registrosDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    if (jsonFiles.length === 0) {
      throw new Error('No hay registros disponibles. Debe crear al menos un registro antes de generar un informe.');
    }

    // Si se proporcionan parámetros de búsqueda, buscar registro específico
    if (parametrosBusqueda && (parametrosBusqueda.identificacion || parametrosBusqueda.nombreArchivo)) {

      // Si se especifica nombre de archivo directamente
      if (parametrosBusqueda.nombreArchivo) {
        const archivoEspecifico = jsonFiles.find(file => file === parametrosBusqueda.nombreArchivo);
        if (archivoEspecifico) {
          return archivoEspecifico;
        }
      }

      // Buscar por identificación del paciente
      if (parametrosBusqueda.identificacion) {
        for (const archivo of jsonFiles) {
          try {
            const filePath = path.join(registrosDir, archivo);
            const data = await fs.promises.readFile(filePath, 'utf8');
            const registro = JSON.parse(data);

            const identificacionArchivo = registro.paciente?.identificacion?.numero;
            if (identificacionArchivo === parametrosBusqueda.identificacion) {
              return archivo;
            }
          } catch (error) {
            console.error(`Error leyendo archivo ${archivo}:`, error);
            // Continuar con el siguiente archivo
          }
        }
      }
    }

    // Fallback: Retornar el archivo más reciente (por fecha de modificación)
    const archivosConStats = await Promise.all(
      jsonFiles.map(async (file) => {
        try {
          const filePath = path.join(registrosDir, file);
          const stats = await fs.promises.stat(filePath);
          return { file, mtime: stats.mtime };
        } catch (error) {
          return { file, mtime: new Date(0) }; // Fecha muy antigua si hay error
        }
      })
    );

    // Ordenar por fecha de modificación descendente (más reciente primero)
    archivosConStats.sort((a, b) => b.mtime - a.mtime);

    return archivosConStats[0].file;

  } catch (error) {
    console.error('Error obteniendo registro disponible:', error);
    throw error;
  }
});

// IPC handler para leer archivos HTML desde src/
ipcMain.handle('leer-archivo-html', async (event, nombreArchivo) => {
  try {
    const filePath = path.join(__dirname, 'src', nombreArchivo);

    if (!fs.existsSync(filePath)) {
      throw new Error(`El archivo ${nombreArchivo} no existe en la carpeta src.`);
    }

    const data = await fs.promises.readFile(filePath, 'utf8');
    return data;
  } catch (error) {
    console.error(`Error leyendo archivo HTML ${nombreArchivo}:`, error);
    throw error;
  }
});

// IPC handler para abrir enlaces externos en el navegador predeterminado
ipcMain.handle('open-external', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    console.error('Error al abrir enlace externo:', error);
    return { success: false, error: error.message };
  }
});
