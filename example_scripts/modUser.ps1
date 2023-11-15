param (
  [Parameter(Mandatory=$true)][string]$user,
  [Parameter(Mandatory=$true)][string]$attrib,
  [Parameter(Mandatory=$true)][string]$credUser,
  [Parameter(Mandatory=$true)][string]$credPass
)

[secureString]$credString = ConvertTo-SecureString $credPass -AsPlainText -Force

[pscredential]$cred = New-Object System.Management.Automation.PSCredential ($credUser, $credString)

Set-ADUser $user -Add @{"extensionattribute1"=$attrib} -Credential $cred
