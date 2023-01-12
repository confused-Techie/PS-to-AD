Get-ADUser -Filter * -SearchBase "OU=Staff,DC=beardsley,DC=k12,DC=ca,DC=us" | ConvertTo-Json | Out-File -FilePath ".cache/ad_data.json" -Encoding ASCII
