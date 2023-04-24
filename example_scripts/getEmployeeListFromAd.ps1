$users = Get-ADUser -Properties * -Filter * -SearchBase "OU=Staff,DC=contoso,DC=com"
$users | ConvertTo-Json | Out-File -FilePath ".cache/ad_data.json" -Encoding ASCII
