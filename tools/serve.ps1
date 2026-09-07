param([int]$Port = 4173)

$ErrorActionPreference = 'Stop'
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCommand) {
  $nodeExecutable = $nodeCommand.Source
} else {
  $nodeExecutable = 'C:\Program Files\RStudio\resources\app\bin\node\node.exe'
}
if (-not (Test-Path -LiteralPath $nodeExecutable -PathType Leaf)) {
  throw 'Node.js was not found. Install Node.js and rerun this script.'
}

& $nodeExecutable (Join-Path $PSScriptRoot 'serve.mjs') $Port
exit $LASTEXITCODE
