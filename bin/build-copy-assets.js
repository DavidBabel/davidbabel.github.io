
// helps to generate src_tmp by copying the asset depending of datas.yml

const fs = require('fs-extra');

const datas = fs.readFileSync(process.argv[2]);
const output = process.argv[3];
const quiet = Boolean(process.argv[4]);

const config = JSON.parse(datas).courses.list;

String.prototype.strip = function (searchValue) {
  return this.replace(searchValue, '');
};

let l = console.log;
if (quiet) {
  l = () => { };
}

const pdfPath = './cours_pdf/';
const tpPath = './cours_tp/';

for (const promo in config) {
  const currentPath = config[promo].link;

  const tmpPath = output + currentPath;
  fs.ensureDirSync(tmpPath);
  fs.writeFileSync(tmpPath + 'index.html', `{{{include 'partials/index.html' courses.list.${promo}}}}`);

  const currentPromoList = config[promo].list;
  for (const courses in currentPromoList) {
    const currentPath2 = currentPath + currentPromoList[courses].link;

    const tmpPath2 = output + currentPath2;
    fs.ensureDirSync(tmpPath2 + 'cours');
    fs.writeFileSync(tmpPath2 + 'cours/index.html', 'no :)');
    fs.ensureDirSync(tmpPath2 + 'tp');
    fs.writeFileSync(tmpPath2 + 'tp/index.html', 'no :)');
    fs.writeFileSync(tmpPath2 + 'index.html', `{{{include 'partials/cours.html' courses.list.${promo}.list.${courses}}}}`);

    const currentCourseList = currentPromoList[courses].list;
    for (let i = 0; i < currentCourseList.length; i++) {
      const linkDetail = currentCourseList[i].link;
      if (linkDetail && linkDetail.active === true && linkDetail.url && !linkDetail.url.startsWith('http')) {
        const currentPath3 = currentPath2 + linkDetail.url;
        try {
          const srcTpPath = tpPath + currentPath3.strip('tp/').strip(promo + '/') + '/';
          const destTpPath = output + currentPath2 + 'tp/';
          const srcPdfPath = pdfPath + currentPath3.strip('cours/').strip(promo+'/');
          const destPdfPath = output + currentPath3;

          if (fs.pathExistsSync(srcTpPath)) {
            l('TP : copying', srcTpPath + '*', 'to', destTpPath);
            fs.copySync(srcTpPath, destTpPath);
          }
          if (fs.existsSync(srcPdfPath)) {
            l('Cours : copying', srcPdfPath, 'to', destPdfPath);
            fs.copySync(srcPdfPath, destPdfPath);
          }
        } catch (error) {
          console.log('erreur pendant la copie du fichier :');
          console.log(error.message);
        }
      }
    }
  }
}

