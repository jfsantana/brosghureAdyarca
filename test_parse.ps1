$inputFile = "c:\Users\Jesus.Santana\Desktop\ocrd.sql"
$lines = Get-Content -Path $inputFile

$casts = @{}
foreach ($line in $lines) {
    if ($line -like "*INSERT*") {
        $matches = [regex]::Matches($line, 'CAST\((.*?) AS (.*?)\)')
        foreach ($m in $matches) {
            $expr = $m.Groups[1].Value
            $type = $m.Groups[2].Value
            if (-not $casts.ContainsKey($type)) {
                $casts[$type] = [System.Collections.Generic.List[string]]::new()
            }
            if ($casts[$type].Count -lt 5 -and -not $casts[$type].Contains($expr)) {
                $casts[$type].Add($expr)
            }
        }
    }
}

foreach ($key in $casts.Keys) {
    Write-Host "Type: $key"
    foreach ($val in $casts[$key]) {
        Write-Host "   Sample expr: $val"
    }
}
