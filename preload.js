console.log('Preload ejecutado: exponiendo APIs en el contexto global');
// Este archivo puede usarse para exponer APIs seguras al renderer si lo necesitas

const { ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { contextBridge } = require('electron');



contextBridge.exposeInMainWorld('api', {
    leerVariablesJSON: (archivo = 'variables.json') => {
        return new Promise((resolve, reject) => {
            // Usa __dirname para obtener la ruta base del preload
            const filePath = path.join(__dirname, archivo);

            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                        resolve(JSON.parse(data));
                    } catch (parseErr) {
                        reject(parseErr);
                    }
                }
            });
        });
    },
    leerRegistroJSON: (nombreArchivo) => {
        return ipcRenderer.invoke('leer-registro', nombreArchivo);
    },
    listarArchivosRegistros: () => {
        return ipcRenderer.invoke('listar-registros');
    },
    // Método para obtener un registro válido disponible
    obtenerRegistroDisponible: () => {
        return ipcRenderer.invoke('obtener-registro-disponible');
    },
    // Método para leer archivos HTML desde src/
    leerArchivoHTML: (nombreArchivo) => {
        return ipcRenderer.invoke('leer-archivo-html', nombreArchivo);
    },
    generarUUID: () => {
        return crypto.randomUUID();
    },
    calcularGrupoEtario: (edadActual) => {
        const totalMeses = (edadActual.años || 0) * 12 + (edadActual.meses || 0);
        
        if (totalMeses < 1) return { codigo: 1, etiqueta: "RN" };
        if (totalMeses >= 1 && totalMeses <= 6) return { codigo: 6, etiqueta: "1 a 6 meses" };
        if (totalMeses > 6 && totalMeses <= 12) return { codigo: 12, etiqueta: "7 a 12 meses" };
        if (totalMeses > 12 && totalMeses <= 18) return { codigo: 18, etiqueta: "1 año y medio" };
        if (totalMeses > 18 && totalMeses <= 24) return { codigo: 24, etiqueta: "Dos años" };
        if (totalMeses > 24 && totalMeses <= 36) return { codigo: 36, etiqueta: "Tres años" };
        if (totalMeses > 36 && totalMeses <= 48) return { codigo: 48, etiqueta: "Cuatro años" };
        if (totalMeses > 48 && totalMeses <= 60) return { codigo: 60, etiqueta: "Cinco años" };
        if (totalMeses > 60 && totalMeses <= 72) return { codigo: 72, etiqueta: "Seis años" };
        if (totalMeses > 72 && totalMeses <= 84) return { codigo: 84, etiqueta: "Siete años" };
        if (totalMeses > 84 && totalMeses <= 96) return { codigo: 96, etiqueta: "Ocho años" };
        if (totalMeses > 96 && totalMeses <= 108) return { codigo: 108, etiqueta: "Nueve años" };
        if (totalMeses > 108 && totalMeses <= 120) return { codigo: 120, etiqueta: "Diez años" };
        if (totalMeses > 120 && totalMeses <= 156) return { codigo: 156, etiqueta: "De once a trece años" };
        return { codigo: 216, etiqueta: "De catorce a dieciocho años" };
    }
});

contextBridge.exposeInMainWorld('registroAPI', {
    guardarRegistro: (registro, nombreArchivo) => ipcRenderer.invoke('guardar-registro', registro, nombreArchivo),
    actualizarRegistro: (registro, rutaArchivo) => ipcRenderer.invoke('actualizar-registro', registro, rutaArchivo),
    abrirNuevoInforme: () => ipcRenderer.invoke('abrir-nuevo-informe')
});

contextBridge.exposeInMainWorld('electronAPI', {
    openExternal: (url) => ipcRenderer.invoke('open-external', url)
});
