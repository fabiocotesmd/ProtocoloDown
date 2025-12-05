; Script NSIS para Cumplimiento Protocolo Down
; Generado para v1.4.0

; Incluir Modern UI
!include "MUI2.nsh"

; Información general
Name "Cumplimiento Protocolo Down"
OutFile "dist\Cumplimiento-Protocolo-Down-1.4.0-setup.exe"
InstallDir "$PROGRAMFILES64\Cumplimiento Protocolo Down"
InstallDirRegKey HKLM "Software\CumplimientoProtocoloDown" "Install_Dir"
RequestExecutionLevel admin

; Configuración de la interfaz
!define MUI_ABORTWARNING
!define MUI_ICON "favicon.ico"
!define MUI_UNICON "favicon.ico"

; Páginas del instalador
!insertmacro MUI_PAGE_LICENSE "LICENSE"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES

; Páginas del desinstalador
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

; Idioma
!insertmacro MUI_LANGUAGE "Spanish"

; Sección de instalación
Section "Cumplimiento Protocolo Down" SecInstall

  SetOutPath "$INSTDIR"

  ; Copiar todos los archivos desde release
  File /r "release\Cumplimiento Protocolo Down-win32-x64\*.*"

  ; Crear acceso directo en el escritorio
  CreateShortcut "$DESKTOP\Cumplimiento Protocolo Down.lnk" "$INSTDIR\Cumplimiento Protocolo Down.exe"

  ; Crear acceso directo en el menú inicio
  CreateDirectory "$SMPROGRAMS\Cumplimiento Protocolo Down"
  CreateShortcut "$SMPROGRAMS\Cumplimiento Protocolo Down\Cumplimiento Protocolo Down.lnk" "$INSTDIR\Cumplimiento Protocolo Down.exe"
  CreateShortcut "$SMPROGRAMS\Cumplimiento Protocolo Down\Desinstalar.lnk" "$INSTDIR\Uninstall.exe"

  ; Escribir información de desinstalación en el registro
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CumplimientoProtocoloDown" "DisplayName" "Cumplimiento Protocolo Down"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CumplimientoProtocoloDown" "UninstallString" '"$INSTDIR\Uninstall.exe"'
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CumplimientoProtocoloDown" "DisplayIcon" "$INSTDIR\Cumplimiento Protocolo Down.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CumplimientoProtocoloDown" "Publisher" "Dr. Víctor Mora & Dr. Fabio Cotes"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CumplimientoProtocoloDown" "DisplayVersion" "1.4.0"
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CumplimientoProtocoloDown" "NoModify" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CumplimientoProtocoloDown" "NoRepair" 1

  ; Crear desinstalador
  WriteUninstaller "$INSTDIR\Uninstall.exe"

SectionEnd

; Sección de desinstalación
Section "Uninstall"

  ; Eliminar accesos directos
  Delete "$DESKTOP\Cumplimiento Protocolo Down.lnk"
  Delete "$SMPROGRAMS\Cumplimiento Protocolo Down\*.*"
  RMDir "$SMPROGRAMS\Cumplimiento Protocolo Down"

  ; Eliminar archivos y directorio de instalación
  RMDir /r "$INSTDIR"

  ; Eliminar entradas del registro
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CumplimientoProtocoloDown"
  DeleteRegKey HKLM "Software\CumplimientoProtocoloDown"

SectionEnd
