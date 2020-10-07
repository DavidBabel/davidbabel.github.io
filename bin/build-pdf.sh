#!/bin/sh

# this full the cours_pdf folrder

output=cours_pdf
saved_position=/Users/david/Desktop/tmp

rm -rf $output
mkdir $output
rm -rf $saved_position
mkdir $saved_position

for pathOfFile in ../\#*/*
do
  case $pathOfFile in
    *.key)
      matiere=$(echo $pathOfFile | cut -f 2 -d "/" | cut -f 2 -d " ")
      mkdir "${output}/${matiere}" 2>/dev/null
      keyFileName=$(echo $pathOfFile | cut -f 3 -d "/")
      pdfFileName="${keyFileName}.pdf"
      outputBasePath=$(cd "$output"; pwd)
      absoluteDirPath=$(cd "$(dirname "$pathOfFile")"; pwd)
      absoluteKeynotePath="${absoluteDirPath}/${keyFileName}"

      osascript << EOF
tell application "System Events"
  tell application "Keynote"
    activate
    open "${absoluteKeynotePath}"
  end tell

  tell process "Keynote"
    click menu item "Imprimer…" of menu of menu bar item "Fichier" of menu bar 1

    repeat until sheet 1 of window 1 exists
 	  end repeat

    tell sheet 1 of window 1
      click checkbox "Images en qualité brouillon"
      click menu button "PDF"
      click menu item "Enregistrer au format PDF…" of menu "PDF" of menu button "PDF"

      repeat until sheet 1 exists
      end repeat

      tell sheet 1
        keystroke "g" using {shift down, command down}
        delay 0.2
        keystroke "${saved_position}"
        delay 0.2
        keystroke return
        delay 0.2
        click button "Enregistrer"
        delay 0.2
      end tell
    end tell

    click menu item "Fermer la fenêtre" of menu of menu bar item "Fichier" of menu bar 1
    delay 0.2
  end tell
end tell
EOF

      src="${saved_position}/${pdfFileName}"
      dest="${outputBasePath}/${matiere}/"
      mv "$src" "$dest"
    ;;
  esac
done

sleep 0.5
rm -rf $saved_position


## Apple script detect elements in 5 seconds

# delay 5
# tell application "System Events"
#   tell front window of (first application process whose frontmost is true)
#     set uiElems to entire contents
#   end tell
# end tell


