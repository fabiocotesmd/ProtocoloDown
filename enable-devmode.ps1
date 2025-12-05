# Script para habilitar el modo desarrollador en Windows
# Ejecutar como Administrador

Write-Host "Habilitando Modo Desarrollador en Windows..." -ForegroundColor Green

try {
    # Registro para habilitar modo desarrollador
    $regPath = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock"

    if (!(Test-Path $regPath)) {
        New-Item -Path $regPath -Force | Out-Null
    }

    Set-ItemProperty -Path $regPath -Name "AllowDevelopmentWithoutDevLicense" -Value 1 -Type DWord -Force
    Set-ItemProperty -Path $regPath -Name "AllowAllTrustedApps" -Value 1 -Type DWord -Force

    Write-Host "✅ Modo Desarrollador habilitado exitosamente" -ForegroundColor Green
    Write-Host "   Ahora puedes ejecutar: npm run build" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host "⚠️  Asegúrate de ejecutar este script como Administrador" -ForegroundColor Yellow
}
