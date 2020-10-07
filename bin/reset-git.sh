#!/bin/sh

ls $datas_tmp 2>/dev/null && echo "${datas_tmp} exists, script stoping" && exit 1

read -p "Are you sure (y/n)?" choice
case "$choice" in
  y|Y )
    cp $datas $datas_tmp

    sed -i.bak s/"active: true"/"active: false"/g $datas_tmp
    sed -i.2bak s/"date: .*"/"date:"/g $datas_tmp
    echo "➜ done"
  ;;
  n|N ) echo "aborting ...";;
  * ) echo "invalid answer";;
esac
