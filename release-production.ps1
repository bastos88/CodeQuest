param(
  [switch]$Push,
  [string]$Message = "feat: update CodeQuest platform"
)

$ErrorActionPreference = "Stop"

function Write-Ok {
  param([string]$Text)
  Write-Host "[OK] $Text" -ForegroundColor Green
}

function Write-Warn {
  param([string]$Text)
  Write-Host "[WARN] $Text" -ForegroundColor Yellow
}

function Write-Fail {
  param([string]$Text)
  Write-Host "[ERROR] $Text" -ForegroundColor Red
}

function Test-Command {
  param([string]$Command)
  return $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " CodeQuest - Release Production Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Command "git")) {
throw "Git nao foi encontrado no PATH."
}

if (-not (Test-Command "npm")) {
throw "NPM nao foi encontrado no PATH."
}

if (-not (Test-Path "package.json")) {
throw "Execute este script na raiz do projeto."
}

Write-Host "[1] Verificando branch..." -ForegroundColor Magenta

$branch = git branch --show-current

if ($branch -ne "main") {
Write-Warn "Branch atual: $branch"
Write-Warn "A producao normalmente deve sair da branch main."
} else {
Write-Ok "Branch main ativa."
}

Write-Host ""
Write-Host "[2] Verificando arquivos sensiveis rastreados..." -ForegroundColor Magenta

$sensitiveTracked = git ls-files | Where-Object {
  # Git paths may contain characters that System.IO.Path rejects on Windows.
  $fileName = ($_ -split '/')[-1]
  $isEnvironmentFile =
    $fileName -eq '.env' -or
    ($fileName.StartsWith('.env.') -and $fileName -ne '.env.example')

  $isEnvironmentFile -or $_ -match '\.(pem|key|pfx|p12)$'
}

if ($sensitiveTracked) {
Write-Fail "Arquivos sensiveis encontrados no Git:"
$sensitiveTracked | ForEach-Object {
Write-Host "  $_" -ForegroundColor Red
}

throw "Remova arquivos sensiveis do indice Git antes do deploy."
}

Write-Ok "Nenhum arquivo sensivel rastreado."

Write-Host ""
Write-Host "[3] Verificando arquivos gerados rastreados..." -ForegroundColor Magenta

$generatedTracked = git ls-files | Where-Object {
  $_ -match 'tsconfig\.tsbuildinfo$' -or
  $_ -match '(^|/)(dist|build|coverage|node_modules)(/|$)' -or
  $_ -match '\.log$'
}

if ($generatedTracked) {
Write-Warn "Arquivos gerados rastreados:"
$generatedTracked | ForEach-Object {
Write-Host "  $_" -ForegroundColor Yellow
}
} else {
Write-Ok "Nenhum arquivo gerado rastreado."
}

Write-Host ""
Write-Host "[4] Verificando logs de debug no frontend..." -ForegroundColor Magenta

$debugLogs = Get-ChildItem "apps/web/src" -Recurse -File -ErrorAction SilentlyContinue |
  Select-String -Pattern 'console\.(log|table|debug)' -ErrorAction SilentlyContinue

if ($debugLogs) {
Write-Warn "Logs de debug encontrados:"
$debugLogs | ForEach-Object {
  Write-Host "  $($_.Path):$($_.LineNumber) -> $($_.Line.Trim())" -ForegroundColor Yellow
}
} else {
Write-Ok "Nenhum console.log/table/debug encontrado."
}

Write-Host ""
Write-Host "[5] Rodando validação completa..." -ForegroundColor Magenta

npm run validate

if ($LASTEXITCODE -ne 0) {
throw "Validação falhou. Corrija antes de enviar para producao."
}

Write-Ok "Build, lint e testes passaram."

Write-Host ""
Write-Host "[6] Verificando status do Git..." -ForegroundColor Magenta

git status --short

$changes = git status --short

if (-not $changes) {
Write-Warn "Nenhuma alteracao pendente para commit."
exit 0
}

Write-Host ""
Write-Host "[7] Adicionando apenas arquivos do projeto..." -ForegroundColor Magenta

$allowedPaths = @(
".gitignore",
".playwright-cli",
"apps/api",
"apps/web",
"output",
"packages/shared",
"package.json",
"package-lock.json",
"vercel.json",
"PROJECT_AUDIT.md",
"release-production.ps1",
"cleanup-generated-images.ps1",
"cleanup-project.ps1"
)

foreach ($path in $allowedPaths) {
  git add -A -- $path
}

Write-Host ""
Write-Host "[8] Arquivos preparados para commit..." -ForegroundColor Magenta

git diff --cached --name-status

$staged = git diff --cached --name-only

if (-not $staged) {
throw "Nenhum arquivo foi preparado para commit."
}

Write-Host ""
Write-Host "[9] Criando commit..." -ForegroundColor Magenta

git commit -m $Message

if ($LASTEXITCODE -ne 0) {
throw "Commit falhou."
}

Write-Ok "Commit criado."

if ($Push) {
Write-Host ""
Write-Host "[10] Enviando para GitHub..." -ForegroundColor Magenta

git push origin $branch

if ($LASTEXITCODE -ne 0) {
throw "Push falhou."
}

Write-Ok "Push enviado para origin/$branch."
Write-Host ""
Write-Host "Se Vercel e Railway estiverem conectados ao GitHub," -ForegroundColor Cyan
Write-Host "o deploy de producao deve iniciar automaticamente." -ForegroundColor Cyan
} else {
Write-Host ""
Write-Warn "Commit criado, mas push nao foi enviado."
Write-Host "Para enviar depois, rode:" -ForegroundColor Cyan
Write-Host "git push origin $branch" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Release finalizada" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
