#Requires -Version 5.1
<#
.SYNOPSIS
  Build Web API và export OpenAPI 3.0 vào docs/api/swagger.json (Swashbuckle CLI).

.DESCRIPTION
  Cần ConnectionStrings__DefaultConnection (PostgreSQL) vì Program.cs đăng ký DbContext khi khởi động host.
  Ưu tiên: biến môi trường đã set sẵn; hoặc file .env.local ở gốc repo (định dòng KEY=VALUE đơn giản cho ConnectionStrings__DefaultConnection).

.PARAMETER Configuration
  Debug hoặc Release (mặc định Release).
#>
param(
    [ValidateSet("Debug", "Release")]
    [string] $Configuration = "Release"
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$csproj = Join-Path $repoRoot "Web.csproj"
$outFile = Join-Path $repoRoot "docs\api\swagger.json"

function Import-DotEnvLocal {
    param([string] $Path)
    if (-not (Test-Path $Path)) { return }
    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith("#")) { return }
        $i = $line.IndexOf("=")
        if ($i -lt 1) { return }
        $key = $line.Substring(0, $i).Trim()
        $val = $line.Substring($i + 1).Trim().Trim('"')
        if ($key) { Set-Item -Path "Env:$key" -Value $val }
    }
}

if (-not $env:ConnectionStrings__DefaultConnection) {
    $envLocal = Join-Path $repoRoot ".env.local"
    Import-DotEnvLocal -Path $envLocal
}

if (-not $env:ConnectionStrings__DefaultConnection) {
    Write-Error "Thiếu ConnectionStrings__DefaultConnection. Đặt biến môi trường hoặc thêm vào .env.local ở $repoRoot"
}

Set-Location $repoRoot
Write-Host ">> dotnet tool restore"
dotnet tool restore
Write-Host ">> dotnet build $Configuration"
dotnet build $csproj -c $Configuration --no-incremental -p:UseAppHost=false

$dll = Join-Path $repoRoot "bin\$Configuration\net8.0\Web.dll"
if (-not (Test-Path $dll)) {
    Write-Error "Không tìm thấy $dll sau build."
}

$swaggerDir = Split-Path $outFile -Parent
if (-not (Test-Path $swaggerDir)) {
    New-Item -ItemType Directory -Path $swaggerDir | Out-Null
}

Write-Host ">> swagger tofile -> $outFile"
dotnet swagger tofile --output $outFile $dll v1
Write-Host "OK: OpenAPI đã ghi."
