[Setup]
AppName=Bank Automat
AppVersion={#VERSION}
AppPublisher=Bank Automat Team
AppPublisherURL=https://github.com/yourusername/bank-automat
DefaultDirName={autopf}\Bank Automat
DefaultGroupName=Bank Automat
OutputDir=output
OutputBaseFilename=BankAutomatSetup-{#VERSION}
Compression=lzma2
SolidCompression=yes
PrivilegesRequired=lowest
ShowLanguageDialog=no
UninstallDisplayIcon={app}\bank-automat.exe
LicenseFile=

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "build\bank-automat.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "build\*.dll"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "build\platforms\*"; DestDir: "{app}\platforms"; Flags: ignoreversion
Source: "build\styles\*"; DestDir: "{app}\styles"; Flags: ignoreversion
Source: "build\imageformats\*"; DestDir: "{app}\imageformats"; Flags: ignoreversion
Source: "build\networkinformation\*"; DestDir: "{app}\networkinformation"; Flags: ignoreversion

[Icons]
Name: "{group}\Bank Automat"; Filename: "{app}\bank-automat.exe"
Name: "{group}\{cm:UninstallProgram,Bank Automat}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\Bank Automat"; Filename: "{app}\bank-automat.exe"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Run]
Filename: "{app}\bank-automat.exe"; Description: "{cm:LaunchProgram,Bank Automat}"; Flags: nowait postinstall skipifsilent

[Code]
var
  DBIPPage: TInputQueryWizardPage;

procedure InitializeWizard();
begin
  { Create custom page to ask for DB_IP }
  DBIPPage := CreateInputQueryPage(wpSelectDir,
    'Database Configuration',
    'Enter Database IP Address',
    'Please enter the IP address of your database server:');
  DBIPPage.Add('DB_IP:', False);
  DBIPPage.Values[0] := 'localhost';
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  EnvFilePath: string;
  EnvContent: string;
  DBIPValue: string;
begin
  if CurStep = ssPostInstall then
  begin
    { Get the DB_IP value from the user input }
    DBIPValue := DBIPPage.Values[0];
    
    { Create .env file in user's home directory }
    EnvFilePath := ExpandConstant('{userdocs}\..\.env');
    
    EnvContent := 'DB_IP=' + DBIPValue;
    
    { Write the .env file }
    if not SaveStringToFile(EnvFilePath, EnvContent, False) then
    begin
      MsgBox('Warning: Could not create .env file at ' + EnvFilePath + '. You may need to create it manually.', mbInformation, MB_OK);
    end
    else
    begin
      MsgBox('Database configuration saved to: ' + EnvFilePath, mbInformation, MB_OK);
    end;
  end;
end;
