
String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

String.prototype.toCode = function () {
  var target = this;
  return target
    .replaceAll("`", '"')
    .replaceAll("#€#€", '`')
    .replaceAll('/n', '\\n')
    .replaceAll('\\\\', '/')
    .replaceAll('…', '\n')
    .replaceAll('÷', ':')
    .replaceAll('§§', '\\n')
    ;
};

var clickOn = function (elem) {
  if (elem.click) {
    elem.click();
  } else if (elem.onclick) {
    elem.onclick();
  }
};

var alreadyRunning;
// https://blog.codepen.io/documentation/api/prefill/
var openInCodepen = function (element) {
  if (alreadyRunning) return;

  alreadyRunning = true;

  const datas = {
    pen_type: element.getAttribute('data-pen-type'),
    title: element.getAttribute('data-title'),
    description: element.getAttribute('data-description'),
    js_external: element.getAttribute('data-js-ext') &&
      element.getAttribute('data-js-ext').toCode().split(',') || [],
    css_external: element.getAttribute('data-css-ext') &&
      element.getAttribute('data-css-ext').toCode().split(',') || [],
    html: element.getAttribute('data-html'),
    css: element.getAttribute('data-css'),
    override_editors: element.getAttribute('data-override-editors'),
    js: element.getAttribute('data-js'),
    prompt: element.getAttribute('data-prompt'),
    show_prompt: Boolean(element.getAttribute('data-show-prompt')),
  };

  switch (datas.pen_type) {
    case 'algo':
      datas.js_external.push('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js');
      datas.js_external.push('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.33.0/codemirror.js');
      datas.js_external.push('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.33.0/addon/mode/simple.js');
      // datas.js_external.push('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.33.0/addon/hint/show-hint.js');
      datas.js_external.push('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/highlight.min.js');
      datas.js_external.push('https://davidbabel.github.io/language_algo/index.js');
      datas.css_external.push('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.33.0/codemirror.css');
      datas.css_external.push('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.33.0/addon/hint/show-hint.css');
      datas.css_external.push('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/default.min.css');
      datas.css_external.push('https://davidbabel.github.io/language_algo/style.css');
      break;
    case 'html':
      // datas.js_external.push('');
      // datas.css_external.push('');
      break;
    case 'css':
      // datas.js_external.push('');
      // datas.css_external.push('');
      break;
    case 'js':
      // datas.js_external.push('');
      // datas.css_external.push('');
      break;
    case 'js-console':
      // datas.js_external.push('');
      // datas.css_external.push('');
      break;
  }

  var pen = {};
  pen.title = datas.title;
  pen.description = datas.description;
  pen.js_external = datas.js_external.join(';');
  pen.css_external = datas.css_external.join(';');
  pen.editors = '';
  if (datas.html) {
    pen.html = datas.html.toCode();
    pen.editors += '1'
  } else {
    pen.editors += '0'
  }
  if (datas.css) {
    pen.css = datas.css.toCode();
    pen.editors += '1'
  } else {
    pen.editors += '0'
  }
  if (datas.js) {
    pen.js = datas.js.toCode();
    pen.editors += '1'
  } else {
    pen.editors += '0'
  }

  switch (datas.pen_type) {
    case 'algo':
      if (datas.prompt) {
        pen.js = (pen.js || '') +
          ";$('#args').val('" +
          datas.prompt.replaceAll("`", '"').trim() +
          "');$('#args').trigger('input');";
      } else if (datas.show_prompt) {
      } else {
        pen.js = (pen.js || '') +
          ";$('#prompt_visibility').trigger('click');";
      }
      break;
    case 'html':
      pen.editors = '1000';
      break;
    case 'css':
      pen.editors = '1100';
      break;
    case 'js':
      pen.editors += '1';
      pen.html = (pen.html || '') +
        '\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n'+
        '<script>'.trim() +
        '  console.clear();'.trim() +
        '  var $ = function (elem) {'.trim() +
        '    var res = document.querySelectorAll( elem );'.trim() +
        '    return res.length > 1 ? res : res[0];'.trim() +
        '  };'.trim() +
        '  Object.prototype.on = function (e,cb) {'.trim() +
        '    if ( Array.from(this).length > 0 ) {'.trim() +
        '      Array.from(this).forEach( function (elem) {'.trim() +
        '        elem.addEventListener(e,cb);'.trim() +
        '      });'.trim() +
        '    } else {'.trim() +
        '      this.addEventListener(e,cb);'.trim() +
        '    }'.trim() +
        '  };'.trim() +
        '</script>';
      break;
    case 'js-console':
      pen.editors = '0012';
      pen.html = (pen.html || '') + '<script>console.clear();</script>';
      break;
  }

  if (datas.override_editors) {
    pen.editors = datas.override_editors;
  }

  console.log(pen);

  const form = document.createElement('form');
  form.action = 'https://codepen.io/pen/define';
  form.method = 'POST';
  form.target = '_blank';
  const inputHidden = document.createElement('input');
  inputHidden.type = 'hidden';
  inputHidden.name = 'data';
  inputHidden.value = JSON.stringify(pen);
  const inputSubmit = document.createElement('input');
  inputSubmit.type = 'submit';
  inputSubmit.value = 'will be auto clicked';
  form.appendChild(inputHidden);
  form.appendChild(inputSubmit);
  const container = document.getElementById('hidden-clicks');
  container.appendChild(form);
  clickOn(inputSubmit);

  alreadyRunning = false;

  return false;
};
