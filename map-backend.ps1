# map-backend.ps1
# Mapeia arquivos importantes do backend CodeQuest para localizar rotas, controllers, services,
# middlewares, chamadas Prisma, endpoints de reviews/questions/categories/quizzes e validações.

$Root = "C:\Users\leozi\Desktop\frontend-quiz"
$ApiPath = Join-Path $Root "apps\api"
$OutputDir = Join-Path $Root "backend-map"

if (!(Test-Path $ApiPath)) {
  Write-Host "Pasta da API não encontrada em: $ApiPath" -ForegroundColor Red
  exit
}

if (!(Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$Files = Get-ChildItem -Path $ApiPath -Recurse -Include *.ts,*.tsx,*.js,*.jsx |
  Where-Object {
    $_.FullName -notmatch "\\node_modules\\" -and
    $_.FullName -notmatch "\\dist\\" -and
    $_.FullName -notmatch "\\build\\"
  }

Write-Host "`n=== Mapeando backend em: $ApiPath ===" -ForegroundColor Cyan
Write-Host "Arquivos analisados: $($Files.Count)" -ForegroundColor Yellow

# 1. Estrutura geral
$Files |
  Select-Object FullName |
  Out-File -Encoding utf8 (Join-Path $OutputDir "01-backend-files.txt")

# 2. Rotas Express
Select-String -Path $Files.FullName `
  -Pattern "app\.get", "app\.post", "app\.patch", "app\.put", "app\.delete", "router\.get", "router\.post", "router\.patch", "router\.put", "router\.delete" `
  -CaseSensitive:$false |
  Select-Object Path, LineNumber, Line |
  Format-Table -AutoSize |
  Out-String -Width 300 |
  Out-File -Encoding utf8 (Join-Path $OutputDir "02-routes.txt")

# 3. Endpoints críticos
Select-String -Path $Files.FullName `
  -Pattern "/reviews", "/questions", "/categories", "/quizzes", "/admin", "/profile", "/auth" `
  -CaseSensitive:$false |
  Select-Object Path, LineNumber, Line |
  Format-Table -AutoSize |
  Out-String -Width 300 |
  Out-File -Encoding utf8 (Join-Path $OutputDir "03-critical-endpoints.txt")

# 4. Rotas de review/reject/approve
Select-String -Path $Files.FullName `
  -Pattern "reject", "approve", "pending", "review", "reviews" `
  -CaseSensitive:$false |
  Select-Object Path, LineNumber, Line |
  Format-Table -AutoSize |
  Out-String -Width 300 |
  Out-File -Encoding utf8 (Join-Path $OutputDir "04-reviews-flow.txt")

# 5. Rotas de delete/archive/restore
Select-String -Path $Files.FullName `
  -Pattern "delete", "deleteMany", "archive", "archivedAt", "restore", "isActive", "usedCount" `
  -CaseSensitive:$false |
  Select-Object Path, LineNumber, Line |
  Format-Table -AutoSize |
  Out-String -Width 300 |
  Out-File -Encoding utf8 (Join-Path $OutputDir "05-delete-archive-restore.txt")

# 6. Prisma usage
Select-String -Path $Files.FullName `
  -Pattern "prisma\.", "PrismaClient", "\$transaction", "findMany", "findFirst", "findUnique", "create", "update", "delete", "upsert" `
  -CaseSensitive:$false |
  Select-Object Path, LineNumber, Line |
  Format-Table -AutoSize |
  Out-String -Width 300 |
  Out-File -Encoding utf8 (Join-Path $OutputDir "06-prisma-usage.txt")

# 7. Middleware de autenticação
Select-String -Path $Files.FullName `
  -Pattern "requireAuth", "authMiddleware", "verifyAccessToken", "jwt", "Authorization", "Bearer", "TokenExpiredError" `
  -CaseSensitive:$false |
  Select-Object Path, LineNumber, Line |
  Format-Table -AutoSize |
  Out-String -Width 300 |
  Out-File -Encoding utf8 (Join-Path $OutputDir "07-auth-middleware.txt")

# 8. Validações / 422
Select-String -Path $Files.FullName `
  -Pattern "422", "Unprocessable", "zod", "safeParse", "parse", "validation", "validate", "required", "reason", "rejectedReason" `
  -CaseSensitive:$false |
  Select-Object Path, LineNumber, Line |
  Format-Table -AutoSize |
  Out-String -Width 300 |
  Out-File -Encoding utf8 (Join-Path $OutputDir "08-validations-422.txt")

# 9. Status codes
Select-String -Path $Files.FullName `
  -Pattern "status\(400\)", "status\(401\)", "status\(403\)", "status\(404\)", "status\(409\)", "status\(422\)", "status\(500\)" `
  -CaseSensitive:$false |
  Select-Object Path, LineNumber, Line |
  Format-Table -AutoSize |
  Out-String -Width 300 |
  Out-File -Encoding utf8 (Join-Path $OutputDir "09-status-codes.txt")

# 10. Quiz start / categorias
Select-String -Path $Files.FullName `
  -Pattern "quizzes/start", "start", "categoryId", "categorySlug", "difficulty", "amount", "limit", "Category", "categories" `
  -CaseSensitive:$false |
  Select-Object Path, LineNumber, Line |
  Format-Table -AutoSize |
  Out-String -Width 300 |
  Out-File -Encoding utf8 (Join-Path $OutputDir "10-quiz-categories-flow.txt")

# 11. Contribute / contribution
Select-String -Path $Files.FullName `
  -Pattern "contribute", "contribution", "submit", "QuestionStatus", "PENDING", "APPROVED", "REJECTED", "IN_REVIEW" `
  -CaseSensitive:$false |
  Select-Object Path, LineNumber, Line |
  Format-Table -AutoSize |
  Out-String -Width 300 |
  Out-File -Encoding utf8 (Join-Path $OutputDir "11-contribute-flow.txt")

# 12. Schema Prisma
$SchemaPath = Join-Path $ApiPath "prisma\schema.prisma"

if (Test-Path $SchemaPath) {
  Copy-Item $SchemaPath (Join-Path $OutputDir "12-schema.prisma") -Force
}

# 13. Package API
$PackagePath = Join-Path $ApiPath "package.json"

if (Test-Path $PackagePath) {
  Copy-Item $PackagePath (Join-Path $OutputDir "13-api-package.json") -Force
}

# 14. Arquivos mais relevantes completos
$ImportantPatterns = @(
  "server.ts",
  "routes",
  "controllers",
  "services",
  "middleware",
  "auth",
  "questions",
  "reviews",
  "categories",
  "quizzes",
  "admin"
)

$ImportantDir = Join-Path $OutputDir "important-files"

if (!(Test-Path $ImportantDir)) {
  New-Item -ItemType Directory -Path $ImportantDir | Out-Null
}

foreach ($file in $Files) {
  $relative = $file.FullName.Replace($ApiPath, "").TrimStart("\")
  $match = $false

  foreach ($pattern in $ImportantPatterns) {
    if ($relative -match $pattern) {
      $match = $true
      break
    }
  }

  if ($match) {
    $safeName = $relative -replace "[\\/:*?`"<>|]", "__"
    Copy-Item $file.FullName (Join-Path $ImportantDir $safeName) -Force
  }
}

# 15. Resumo
$SummaryPath = Join-Path $OutputDir "00-summary.txt"

@"
BACKEND MAP - CODEQUEST

Raiz:
$Root

API:
$ApiPath

Arquivos analisados:
$($Files.Count)

Arquivos gerados:

01-backend-files.txt
Lista todos os arquivos encontrados no backend.

02-routes.txt
Mostra todas as rotas Express encontradas.

03-critical-endpoints.txt
Mostra endpoints críticos: reviews, questions, categories, quizzes, admin, profile, auth.

04-reviews-flow.txt
Ajuda a localizar approve/reject/pending/review.

05-delete-archive-restore.txt
Ajuda a localizar delete/archive/restore/isActive/archivedAt/usedCount.

06-prisma-usage.txt
Mostra chamadas Prisma: findMany, create, update, delete, transaction, etc.

07-auth-middleware.txt
Mostra autenticação, JWT, Bearer token e middleware.

08-validations-422.txt
Mostra validações que podem causar 422.

09-status-codes.txt
Mostra onde o backend retorna 400, 401, 403, 404, 409, 422, 500.

10-quiz-categories-flow.txt
Mostra fluxo de categorias e start de quiz.

11-contribute-flow.txt
Mostra fluxo de contribuição de perguntas.

12-schema.prisma
Cópia do schema Prisma.

13-api-package.json
Cópia do package da API.

important-files/
Cópia dos arquivos mais prováveis de precisarem alteração.

Próximos focos:
1. Ver 04-reviews-flow.txt para entender /reviews/:id/reject.
2. Ver 08-validations-422.txt para descobrir qual campo está faltando no reject.
3. Ver 05-delete-archive-restore.txt para separar rejeitar de excluir.
4. Ver 10-quiz-categories-flow.txt para corrigir categorias e /quizzes/start.
5. Ver 07-auth-middleware.txt para tratar token expirado.
"@ | Out-File -Encoding utf8 $SummaryPath

Write-Host "`n=== Mapeamento concluído ===" -ForegroundColor Green
Write-Host "Arquivos gerados em: $OutputDir" -ForegroundColor Yellow
Write-Host "`nAbra primeiro:" -ForegroundColor Cyan
Write-Host "$SummaryPath"