Get-ADUser -Filter * -SearchBase "OU=Staff,DC=contoso,DC=com" | ConvertTo-Json | Out-File -FilePath ".cache/ad_data.json" -Encoding ASCII
