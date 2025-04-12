#define MyAppName "Task Tracker"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Task Tracker Team"
#define MyAppURL "https://example.com"
#define MyAppExeName "Task Tracker.exe"
#define MyAppAssocName MyAppName + " File"
#define MyAppAssocExt ".taskdb"
#define MyAppAssocKey StringChange(MyAppAssocName, " ", "") + MyAppAssocExt

[Setup]
; NOTE: The value of AppId uniquely identifies this application.
; Do not use the same AppId value in installers for other applications.
AppId={{53A0E6A7-4F54-490E-9D1B-3F129B4F73FD}
AppName=Task Tracker
AppVersion=1.0
DefaultDirName={autopf}\Task Tracker
DefaultGroupName=Task Tracker
UninstallDisplayIcon={app}\TaskTracker.exe
Compression=lzma2
SolidCompression=yes
OutputDir=.\installer
OutputBaseFilename=Task-Tracker-Setup
PrivilegesRequired=lowest
SetupIconFile=public\favicon.ico
AppPublisher=Task Tracker Team
AppPublisherURL=https://example.com
AppSupportURL=https://example.com/support
AppUpdatesURL=https://example.com/updates
VersionInfoVersion=1.0.0
VersionInfoCompany=Task Tracker Team
VersionInfoProductName=Task Tracker
ChangesAssociations=yes

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 6.1; Check: not IsAdminInstallMode
Name: "associate"; Description: "Associate .taskdb files"; GroupDescription: "File associations:"; Flags: unchecked

[Files]
; Application files
Source: "release\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

; Icons
Source: "public\favicon.ico"; DestDir: "{app}"; Flags: ignoreversion
Source: "public\taskdb.ico"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\Task Tracker"; Filename: "{app}\TaskTracker.exe"; IconFilename: "{app}\favicon.ico"
Name: "{group}\{cm:UninstallProgram,Task Tracker}"; Filename: "{uninstallexe}"
Name: "{commondesktop}\Task Tracker"; Filename: "{app}\TaskTracker.exe"; Tasks: desktopicon; IconFilename: "{app}\favicon.ico"
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\Task Tracker"; Filename: "{app}\TaskTracker.exe"; Tasks: quicklaunchicon; IconFilename: "{app}\favicon.ico"

[Registry]
; File associations
Root: HKA; Subkey: "Software\Classes\.taskdb"; ValueType: string; ValueName: ""; ValueData: "TaskTrackerDataFile"; Flags: uninsdeletevalue; Tasks: associate
Root: HKA; Subkey: "Software\Classes\TaskTrackerDataFile"; ValueType: string; ValueName: ""; ValueData: "Task Tracker Data File"; Flags: uninsdeletekey; Tasks: associate
Root: HKA; Subkey: "Software\Classes\TaskTrackerDataFile\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\taskdb.ico"; Tasks: associate
Root: HKA; Subkey: "Software\Classes\TaskTrackerDataFile\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\TaskTracker.exe"" ""%1"""; Tasks: associate

[Run]
Filename: "{app}\TaskTracker.exe"; Description: "{cm:LaunchProgram,Task Tracker}"; Flags: nowait postinstall skipifsilent

[Code]
function InitializeSetup(): Boolean;
begin
  Result := True;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    // Create necessary directories
    ForceDirectories(ExpandConstant('{app}\resources\app'));
  end;
end; 