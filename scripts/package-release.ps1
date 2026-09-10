$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")).Path
$releaseRoot = Join-Path $projectRoot "release-output"
$archivePath = Join-Path $releaseRoot "SignalRoom-v1.0.0.zip"
$temporaryRoot = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
$stagingRoot = Join-Path $temporaryRoot ("signalroom-release-" + [guid]::NewGuid().ToString("N"))
$packageRoot = Join-Path $stagingRoot "SignalRoom-v1.0.0"

New-Item -ItemType Directory -Path $packageRoot -Force | Out-Null
New-Item -ItemType Directory -Path $releaseRoot -Force | Out-Null

$excludedDirectories = @(
  ".git", "node_modules", "dist", ".next", ".vinext", ".wrangler",
  ".railway", ".sites-runtime", "release-output", "buyer-assets"
)
$excludedFiles = @(".dev.vars")

& robocopy $projectRoot $packageRoot /E /NFL /NDL /NJH /NJS /NP /XD $excludedDirectories /XF $excludedFiles | Out-Null
if ($LASTEXITCODE -ge 8) { throw "Could not stage the SignalRoom release package." }

$hostingDirectory = Join-Path $packageRoot ".openai"
New-Item -ItemType Directory -Path $hostingDirectory -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $projectRoot "buyer-assets\hosting.json") -Destination (Join-Path $hostingDirectory "hosting.json") -Force

Compress-Archive -LiteralPath $packageRoot -DestinationPath $archivePath -CompressionLevel Optimal -Force

$resolvedStaging = [System.IO.Path]::GetFullPath($stagingRoot)
if (-not $resolvedStaging.StartsWith($temporaryRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Refusing to remove an unexpected staging path: $resolvedStaging"
}
Remove-Item -LiteralPath $resolvedStaging -Recurse -Force

Write-Output $archivePath
