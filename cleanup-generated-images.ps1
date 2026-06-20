param(
  [switch]$Remove,
  [switch]$IncludePublic,
  [switch]$IncludeAssets
)

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host " CodeQuest - Limpeza de Imagens Geradas" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$RootPath = (Get-Location).Path
$errors = 0
$warnings = 0
$found = 0
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

function Should-IgnorePath {
  param([string]$FullPath)

  if ($FullPath -match "\\.git\\") {
    return $true
  }

  if ($FullPath -match "\\node_modules\\") {
    return $true
  }

  if ($FullPath -match "\\dist\\") {
    return $true
  }

  if ($FullPath -match "\\build\\") {
    return $true
  }

  if (!$IncludePublic -and $FullPath -match "\\public\\") {
    return $true
  }

  if (!$IncludeAssets -and $FullPath -match "\\assets\\") {
    return $true
  }

  return $false
}

function Is-GeneratedImage {
  param([System.IO.FileInfo]$File)

  $name = $File.Name.ToLower()
  $full = $File.FullName.ToLower()

  $generatedPatterns = @(
    "generated",
    "image\(",
    "captura de tela",
    "screenshot",
    "dall",
    "openai",
    "chatgpt",
    "midjourney",
    "stable",
    "output",
    "export",
    "render",
    "mockup",
    "a_pair_of",
    "file_"
  )

  foreach ($pattern in $generatedPatterns) {
    if ($name -match $pattern -or $full -match $pattern) {
      return $true
    }
  }

  return $false
}

$imageExtensions = @(
  "*.png",
  "*.jpg",
  "*.jpeg",
  "*.webp",
  "*.gif",
  "*.svg"
)

Write-Host "[1] Procurando imagens com nomes típicos de arquivos gerados..." -ForegroundColor Magenta
Write-Host ""

$candidates = @()

foreach ($extension in $imageExtensions) {
  Get-ChildItem -Path . -Recurse -Force -File -Include $extension -ErrorAction SilentlyContinue |
    Where-Object {
      -not (Should-IgnorePath $_.FullName)
    } |
    ForEach-Object {
      if (Is-GeneratedImage $_) {
        $candidates += $_
      }
    }
}

$candidates = $candidates | Sort-Object FullName -Unique

if ($candidates.Count -eq 0) {
  Pass "Nenhuma imagem gerada encontrada pelos padrões definidos."
} else {
  foreach ($file in $candidates) {
    $script:found++

    $relative = Get-RelativePath $file.FullName
    $tracked = Test-GitTracked $relative
    $sizeKB = [Math]::Round($file.Length / 1KB, 2)

    if ($tracked) {
      Warn "Versionada no Git: $relative | $sizeKB KB"
    } else {
      Info "Local/untracked: $relative | $sizeKB KB"
    }

    if ($Remove) {
      try {
        if ($tracked) {
          git rm --ignore-unmatch $relative | Out-Null
          Pass "Removida do Git e do disco: $relative"
        } else {
          Remove-Item $file.FullName -Force -ErrorAction Stop
          Pass "Removida do disco: $relative"
        }

        $script:removed++
      } catch {
        Fail "Falha ao remover $relative -> $($_.Exception.Message)"
      }
    }
  }
}

Write-Host ""
Write-Host "[2] Git status atual..." -ForegroundColor Magenta
git status --short

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host " Resultado" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Imagens encontradas: $found" -ForegroundColor Cyan
Write-Host "Imagens removidas: $removed" -ForegroundColor Green
Write-Host "Erros: $errors" -ForegroundColor $(if ($errors -eq 0) { "Green" } else { "Red" })
Write-Host "Avisos: $warnings" -ForegroundColor $(if ($warnings -eq 0) { "Green" } else { "Yellow" })

if (!$Remove) {
  Write-Host ""
  Warn "Modo simulação. Nada foi apagado."
  Write-Host ""
  Write-Host "Para apagar as imagens encontradas:" -ForegroundColor Cyan
  Write-Host ".\cleanup-generated-images.ps1 -Remove"
  Write-Host ""
  Write-Host "Para incluir imagens dentro de public:" -ForegroundColor Cyan
  Write-Host ".\cleanup-generated-images.ps1 -Remove -IncludePublic"
  Write-Host ""
  Write-Host "Para incluir imagens dentro de assets:" -ForegroundColor Cyan
  Write-Host ".\cleanup-generated-images.ps1 -Remove -IncludeAssets"
  Write-Host ""
  Write-Host "Para incluir public e assets:" -ForegroundColor Cyan
  Write-Host ".\cleanup-generated-images.ps1 -Remove -IncludePublic -IncludeAssets"
}

if ($errors -gt 0) {
  Write-Host ""
  Write-Host "Corrija os erros antes de commitar." -ForegroundColor Red
}