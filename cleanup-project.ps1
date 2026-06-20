param(
  [switch]$Remove,
  [switch]$IncludeNodeModules,
  [switch]$RemoveFromGitIndex
)

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host " CodeQuest - Limpeza de Arquivos" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$RootPath = (Get-Location).Path
$errors = 0
$warnings = 0
$removed = 0

function Pass {
  param([string]$Message)
  Write-Host "[OK] $Message" -ForegroundColor Green
}

function Warn {
  param([string]$Message)
  $script:warnings++
  Write-Host "[AVISO] $Message" -ForegroundColor Yellow
}

function Fail {
  param([string]$Message)
  $script:errors++
  Write-Host "[ERRO] $Message" -ForegroundColor Red
}

function Info {
  param([string]$Message)
  Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Get-RelativePath {
  param([string]$FullPath)

  $resolved = (Resolve-Path $FullPath).Path

  if ($resolved.StartsWith($RootPath)) {
    return $resolved.Substring($RootPath.Length).TrimStart('\', '/') -replace '\\', '/'
  }

  return $resolved -replace '\\', '/'
}

function Test-GitTracked {
  param([string]$RelativePath)

  git ls-files --error-unmatch $RelativePath 2>$null | Out-Null
  return $LASTEXITCODE -eq 0
}

function Remove-Candidate {
  param(
    [string]$Path,
    [string]$Reason
  )

  if (!(Test-Path $Path)) {
    return
  }

  $relative = Get-RelativePath $Path
  $tracked = Test-GitTracked $relative

  if ($tracked) {
    Warn "Versionado no Git: $relative [$Reason]"
  } else {
    Info "Local/untracked: $relative [$Reason]"
  }

  if ($Remove) {
    try {
      if ($tracked -and $RemoveFromGitIndex) {
        git rm -r --cached --ignore-unmatch $relative | Out-Null
        Warn "Removido do indice Git: $relative"
      }

      Remove-Item $Path -Recurse -Force -ErrorAction Stop
      $script:removed++
      Pass "Removido: $relative"
    } catch {
      Fail "Falha ao remover $relative -> $($_.Exception.Message)"
    }
  }
}

Write-Host "[1] Procurando arquivos gerados/cache/build..." -ForegroundColor Magenta

$generatedNames = @(
  "dist",
  "build",
  "coverage",
  ".turbo",
  ".cache",
  ".vite",
  ".parcel-cache",
  ".eslintcache"
)

foreach ($name in $generatedNames) {
  Get-ChildItem -Path . -Recurse -Force -ErrorAction SilentlyContinue |
    Where-Object {
      $_.Name -eq $name -and
      $_.FullName -notmatch "\\.git\\" -and
      $_.FullName -notmatch "\\node_modules\\"
    } |
    ForEach-Object {
      Remove-Candidate -Path $_.FullName -Reason "cache/build"
    }
}

Write-Host ""
Write-Host "[2] Procurando arquivos gerados por extensao..." -ForegroundColor Magenta

$generatedExtensions = @(
  "*.tsbuildinfo",
  "*.log",
  "*.tmp",
  "*.bak",
  "*.old",
  "*.orig"
)

foreach ($pattern in $generatedExtensions) {
  Get-ChildItem -Path . -Recurse -Force -File -Include $pattern -ErrorAction SilentlyContinue |
    Where-Object {
      $_.FullName -notmatch "\\.git\\" -and
      $_.FullName -notmatch "\\node_modules\\"
    } |
    ForEach-Object {
      Remove-Candidate -Path $_.FullName -Reason "arquivo gerado/temporario"
    }
}

Write-Host ""
Write-Host "[3] Procurando arquivos de sistema..." -ForegroundColor Magenta

$systemFiles = @(
  ".DS_Store",
  "Thumbs.db"
)

foreach ($name in $systemFiles) {
  Get-ChildItem -Path . -Recurse -Force -File -Filter $name -ErrorAction SilentlyContinue |
    Where-Object {
      $_.FullName -notmatch "\\.git\\" -and
      $_.FullName -notmatch "\\node_modules\\"
    } |
    ForEach-Object {
      Remove-Candidate -Path $_.FullName -Reason "arquivo de sistema"
    }
}

Write-Host ""
Write-Host "[4] Verificando arquivos sensiveis..." -ForegroundColor Magenta

$sensitivePatterns = @(
  ".env",
  ".env.local",
  ".env.development",
  ".env.production",
  ".env.test",
  "*.pem",
  "*.key",
  "*.crt",
  "*.p12",
  "*.pfx"
)

foreach ($pattern in $sensitivePatterns) {
  Get-ChildItem -Path . -Recurse -Force -File -Include $pattern -ErrorAction SilentlyContinue |
    Where-Object {
      $_.FullName -notmatch "\\.git\\" -and
      $_.FullName -notmatch "\\node_modules\\"
    } |
    ForEach-Object {
      $relative = Get-RelativePath $_.FullName
      $tracked = Test-GitTracked $relative

      if ($tracked) {
        Fail "Arquivo sensivel versionado: $relative"

        if ($RemoveFromGitIndex) {
          git rm --cached --ignore-unmatch $relative | Out-Null
          Warn "Removido do indice Git, mantido localmente: $relative"
        }
      } else {
        Pass "Arquivo sensivel local nao versionado: $relative"
      }
    }
}

Write-Host ""
Write-Host "[5] Procurando scripts temporarios..." -ForegroundColor Magenta

$tempFiles = @(
  "check-production-ready.ps1"
)

foreach ($name in $tempFiles) {
  Get-ChildItem -Path . -Recurse -Force -File -Filter $name -ErrorAction SilentlyContinue |
    Where-Object {
      $_.FullName -notmatch "\\.git\\" -and
      $_.FullName -notmatch "\\node_modules\\"
    } |
    ForEach-Object {
      Remove-Candidate -Path $_.FullName -Reason "script temporario"
    }
}

Write-Host ""
Write-Host "[6] Verificando node_modules..." -ForegroundColor Magenta

Get-ChildItem -Path . -Recurse -Force -Directory -Filter "node_modules" -ErrorAction SilentlyContinue |
  Where-Object {
    $_.FullName -notmatch "\\.git\\"
  } |
  ForEach-Object {
    $relative = Get-RelativePath $_.FullName

    if ($IncludeNodeModules -and $Remove) {
      Remove-Candidate -Path $_.FullName -Reason "node_modules local"
    } else {
      Warn "Encontrado node_modules: $relative"
      Warn "Use -Remove -IncludeNodeModules para apagar node_modules."
    }
  }

Write-Host ""
Write-Host "[7] Verificando .gitignore..." -ForegroundColor Magenta

if (!(Test-Path ".gitignore")) {
  Fail ".gitignore nao encontrado."
} else {
  $gitignore = Get-Content ".gitignore" -Raw

  $requiredIgnores = @(
    "node_modules",
    "dist",
    "build",
    "coverage",
    ".env",
    ".env.local",
    "*.tsbuildinfo",
    "*.log"
  )

  foreach ($item in $requiredIgnores) {
    if ($gitignore -match [regex]::Escape($item)) {
      Pass ".gitignore contem: $item"
    } else {
      Warn ".gitignore talvez precise incluir: $item"
    }
  }
}

Write-Host ""
Write-Host "[8] Git status atual..." -ForegroundColor Magenta

git status --short

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host " Resultado" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Erros: $errors" -ForegroundColor $(if ($errors -eq 0) { "Green" } else { "Red" })
Write-Host "Avisos: $warnings" -ForegroundColor $(if ($warnings -eq 0) { "Green" } else { "Yellow" })

if ($Remove) {
  Write-Host "Removidos: $removed" -ForegroundColor Green
} else {
  Write-Host ""
  Warn "Modo simulacao. Nada foi removido."
  Write-Host ""
  Write-Host "Para remover arquivos gerados/cache:" -ForegroundColor Cyan
  Write-Host ".\cleanup-project.ps1 -Remove"
  Write-Host ""
  Write-Host "Para remover tambem node_modules:" -ForegroundColor Cyan
  Write-Host ".\cleanup-project.ps1 -Remove -IncludeNodeModules"
  Write-Host ""
  Write-Host "Para remover arquivos sensiveis apenas do indice Git, mantendo local:" -ForegroundColor Cyan
  Write-Host ".\cleanup-project.ps1 -RemoveFromGitIndex"
}

if ($errors -gt 0) {
  Write-Host ""
  Write-Host "Corrija os erros antes de enviar para producao." -ForegroundColor Red
} else {
  Write-Host ""
  Write-Host "Nenhum erro critico encontrado." -ForegroundColor Green
}