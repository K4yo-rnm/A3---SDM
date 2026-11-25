# Caminho raiz do projeto
$Projeto = "D:\010-Projetos\Clinica Veterinaria\clinica-veterinaria"

# Arquivo de variáveis de ambiente
$ArquivoEnv = Join-Path $Projeto ".env"

# Endereço da rota de processamento
$Url = "http://localhost:3000/api/integracao-governo/processar-pendentes"

# Verificar se o arquivo .env existe
if (-not (Test-Path $ArquivoEnv)) {
    Write-Output "Arquivo .env não encontrado."
    exit 1
}

# Ler o segredo CRON_SECRET
$LinhaSegredo = Get-Content $ArquivoEnv |
    Where-Object { $_ -match '^\s*CRON_SECRET\s*=' } |
    Select-Object -First 1

if (-not $LinhaSegredo) {
    Write-Output "CRON_SECRET não encontrado."
    exit 1
}

$Segredo = ($LinhaSegredo -split '=', 2)[1].Trim().Trim('"').Trim("'")

if ([string]::IsNullOrWhiteSpace($Segredo)) {
    Write-Output "CRON_SECRET está vazio."
    exit 1
}

# Executar o processamento
try {
    $Resposta = Invoke-RestMethod `
        -Uri $Url `
        -Method POST `
        -Headers @{ Authorization = "Bearer $Segredo" } `
        -TimeoutSec 60

    Write-Output "Processamento executado:"
    $Resposta | ConvertTo-Json -Depth 10

} catch {
    Write-Output "Não foi possível executar o processamento."
    Write-Output $_.Exception.Message
    exit 1
}
