!macro customHeader
  ; Add custom branding
  BrandingText "Task Tracker v1.0.0"
!macroend

!macro customInstall
  ; Create data directory in Documents folder
  CreateDirectory "$DOCUMENTS\TaskTracker"
  
  ; Set up file association
  WriteRegStr HKCR ".taskdb" "" "TaskTracker.Database"
  WriteRegStr HKCR "TaskTracker.Database" "" "Task Tracker Database File"
  WriteRegStr HKCR "TaskTracker.Database\DefaultIcon" "" "$INSTDIR\resources\app\assets\icons\taskdb.ico,0"
  WriteRegStr HKCR "TaskTracker.Database\shell\open\command" "" '"$INSTDIR\${PRODUCT_NAME}.exe" "%1"'
!macroend

!macro customUnInstall
  ; Confirm before removing data
  MessageBox MB_YESNO "Would you like to keep your task data files? Click No to remove all data files." IDYES KeepData IDNO RemoveData
  
  RemoveData:
    RMDir /r "$DOCUMENTS\TaskTracker"
    DetailPrint "Task data files were removed."
    Goto DataDialogEnd
    
  KeepData:
    DetailPrint "Task data files were kept at $DOCUMENTS\TaskTracker"
    
  DataDialogEnd:
  
  ; Remove file association
  DeleteRegKey HKCR ".taskdb"
  DeleteRegKey HKCR "TaskTracker.Database"
!macroend

!macro customInstallMode
  # Additional install mode settings can be defined here
  
  # Custom branding
  !define MUI_WELCOMEFINISHPAGE_BITMAP "assets\installer\welcome.bmp"
  !define MUI_UNWELCOMEFINISHPAGE_BITMAP "assets\installer\welcome.bmp"
  !define MUI_HEADERIMAGE
  !define MUI_HEADERIMAGE_BITMAP "assets\installer\header.bmp"
  !define MUI_HEADERIMAGE_UNBITMAP "assets\installer\header.bmp"
  
  # Custom sections
  Section "Launch at startup" SecStartup
    # No body needed - this section just creates the flag
  SectionEnd
!macroend 