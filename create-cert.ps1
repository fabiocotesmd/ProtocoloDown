# Script para crear certificado autofirmado para firma de código
# Ejecutar como Administrador en PowerShell

$certName = "Cumplimiento Protocolo Down"
$certPassword = "ProtocoloDown2024"  # Cambiar por una contraseña segura
$pfxPath = Join-Path $PSScriptRoot "codesign-cert.pfx"

Write-Host "Creando certificado autofirmado para firma de código..." -ForegroundColor Green

# Crear certificado autofirmado
$cert = New-SelfSignedCertificate `
    -Type CodeSigningCert `
    -Subject "CN=$certName, O=Dr. Victor Mora & Dr. Fabio Cotes, C=CO" `
    -KeyUsage DigitalSignature `
    -FriendlyName "$certName Code Signing" `
    -CertStoreLocation "Cert:\CurrentUser\My" `
    -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3", "2.5.29.19={text}") `
    -NotAfter (Get-Date).AddYears(5)

Write-Host "Certificado creado exitosamente: $($cert.Thumbprint)" -ForegroundColor Green

# Exportar a archivo PFX
$securePassword = ConvertTo-SecureString -String $certPassword -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $securePassword

Write-Host "`nCertificado exportado a: $pfxPath" -ForegroundColor Yellow
Write-Host "Contraseña del certificado: $certPassword" -ForegroundColor Yellow
Write-Host "`n⚠️  IMPORTANTE: Guarda la contraseña en un lugar seguro" -ForegroundColor Red
Write-Host "⚠️  NO compartas el archivo .pfx públicamente" -ForegroundColor Red
Write-Host "`nConfigura la variable de entorno:" -ForegroundColor Cyan
Write-Host "set CERT_PASSWORD=$certPassword" -ForegroundColor White
Write-Host "`nO edita el archivo .env con:" -ForegroundColor Cyan
Write-Host "CERT_PASSWORD=$certPassword" -ForegroundColor White
