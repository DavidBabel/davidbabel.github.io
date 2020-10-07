#!/bin/sh

# config
datas_yml=datas.yml
datas=bin/datas-tmp.json
tmp_datas_clean=bin/tampon.json
src_tmp=cours_tmp
output=cours

# single execution
ls $datas 2>/dev/null && echo "build already running" && exit 1

# clean previous builds
rm -rf ./$output 2>/dev/null
mkdir ./$output
touch ./$output/this_folder_is_generated

rm -rf ./$src_tmp 2>/dev/null
cp -r ./src ./$src_tmp
touch ./$src_tmp/this_folder_is_generated

# echo build for prod
if [ $# -ne 0 ]
then
  echo "building for prod"
fi

# clear jsonp
echo "➜  clean datas"
js-yaml $datas_yml > $tmp_datas_clean
if [ $# -eq 0 ]
then  # clean comments
  sed 's/:local//g' $tmp_datas_clean | sed 's/.*:production.*$//g' | sed 's:// .*$::g' > $datas
else # switch options for dist
  sed 's/:production//g' $tmp_datas_clean | sed 's/.*:local.*$//g' | sed 's:// .*$::g' > $datas
fi
rm $tmp_datas_clean
echo " ➜  done"

# this script loop add the courses assets
echo ""
echo "➜  copy assets"
node bin/build-copy-assets.js $datas ./$src_tmp/ --quiet
echo " ➜  done"

echo ""
echo "➜  build site"
# this loop copy everything to output directory
for file in ./$src_tmp/* ./$src_tmp/**/* ./$src_tmp/**/**/* ./$src_tmp/**/**/**/* ./$src_tmp/**/**/**/**/*
do
  case $file in
    *\*) ;;
    *.html) handlebars $datas < "$file" > "${file/$src_tmp/$output}";;
    *)
      if [[ -d $file ]]; then
        mkdir ${file/$src_tmp/$output} 2>/dev/null
      else
        cp "$file" "${file/$src_tmp/$output}"
      fi
    ;;
  esac
done
echo " ➜  done"

echo ""
echo "➜  cleaning"
sleep 0.5
# clean
rm -rf ./$src_tmp
rm $datas
echo " ➜  done"
echo "build finished"
exit 0