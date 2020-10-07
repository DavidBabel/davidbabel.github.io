'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

document.body.style.color = 'white';

var useIndent = true;
/// CSS
// need : https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.28.0/codemirror.css
// is here : https://davidbabel.github.io/language_algo/style.css
/// JS
// need : https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js
// need : https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.28.0/codemirror.js
// need : https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.28.0/addon/mode/simple.js
// is here : https://davidbabel.github.io/language_algo/index.js

var baseHTML = '\n<div id="splash">D\xE9sol\xE9, ce script ne fonctionne que sous Google Chrome ou Mozilla Firefox,\net pas sur Internet Explorer, car Internet Explorer c\'est pour le d\xE9mon.\nTu as vraiment envie de travailler avec le d\xE9mon ? Si oui tu as tords.\nFerme \xE7a tout de suite, file t\xE9l\xE9charger un vrai navigateur qui n\'est pas cod\xE9 avec les pieds.</div>\n<div id="astuce">Aides de saisie dans l\'\xE9diteur de code : <s>ctrl + espace </s> ou <s>ctrl + n</s></div>\n<div id="menu">\n  <button id="reindent">R\xE9indenter <s>(ctrl + i)</s></button>\n  <button><a target="_blank" href="https://davidbabel.github.io">Doc</a></button>\n  <button id="download">T\xE9l\xE9charger</button>\n  <button>\n    <label>\n      <input type="checkbox" id="prompt_visibility" checked>\n      Voir le prompt\n    </label>\n  </button>\n  <button onclick="loadSavedCode();">r\xE9cup code</button>\n  <span id="auto_save" onclick="toggleSaveActive();">sauvegarde auto activ\xE9e</span>\n  <button class="see_code">\n    <label>\n      <input type="checkbox" id="codebox_visibility">\n      Voir le code\n    </label>\n  </button>\n</div>\n<div id="container" style="display: block !important;">\n  <div id="algo_box">\n      Algorithme :\n    <textarea id="algo">\n\n\n\n\n</textarea>\n  </div>\n  <div id="exec_box">\n      Execution :\n    <div id="terminal-content">\n      <div id="prompt">\n        <span class="cells console">\n          &gt; mon_algo\n        </span>\n        <span class="cells" style="width: 100%;">\n          <input title="Entrez vos param\xE8tres ici" class="console" id="args" type="text" placeholder="param\xE8tres..." spellcheck="false">\n        </span>\n\n      </div>\n\n      <div id="terminal">\n\n      </div>\n    </div>\n  </div>\n  <div id="codebox">\n    Code g\xE9n\xE9r\xE9:\n    <pre id="code" class="javascript"></pre>\n  </div>\n</div>\n';

// Get current page HTML, put it in code editor and delete it from page
var originHTML = $("body").contents().filter(function () {
  return this.nodeType === 3;
});
var baseAlgoCodeToInsert = originHTML[0].data.trim();
originHTML.remove();
$('body').append(baseHTML);

var isDemo = false;

function toggleSaveActive() {
  isDemo = !isDemo;
  $('#auto_save').css('color', isDemo ? 'red' : 'green');
  $('#auto_save').text(isDemo ? 'sauvegarde auto désactivée' : 'sauvegarde auto activée');
}

if (baseAlgoCodeToInsert) {
  toggleSaveActive();
  $('#algo').val("\n" + baseAlgoCodeToInsert + "\n");
}

function detectIE() {
  var ua = window.navigator.userAgent;

  var msie = ua.indexOf('MSIE ');
  if (msie > 0) {
    // IE 10 or older => return version number
    return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
  }

  var trident = ua.indexOf('Trident/');
  if (trident > 0) {
    // IE 11 => return version number
    var rv = ua.indexOf('rv:');
    return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
  }

  var edge = ua.indexOf('Edge/');
  if (edge > 0) {
    // Edge (IE 12+) => return version number
    return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
  }

  // other browser
  return false;
}

if (detectIE()) {
  $('#splash').show();
}

// replace
String.prototype.r = function (search, replacement) {
  return this.replace(new RegExp(search, 'g'), replacement);
};

// begin with
String.prototype.bw = function (find) {
  return new RegExp('^' + find + '[\n ]?').test(this);
};

// polyfill
if (!String.prototype.includes) {
  String.prototype.includes = function (search, start) {
    'use strict';

    if (typeof start !== 'number') {
      start = 0;
    }

    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

// permet de définir le value avec des simples quotes au load
$('#args').val($('#args').val().r("'", '"'));

window.logs = [];
console.oldLog = console.log;
console.log = function (arg) {
  window.logs.push(arg);
  if (arg === true) {
    arg = 'VRAI';
  } else if (arg === false) {
    arg = 'FAUX';
  }
  console.oldLog(arg);
  $('#terminal').append('<span class="console">' + arg + '</span>');
};

var warningBoucle = function warningBoucle() {
  $('#terminal').html('');
  console.log('ATTENTION !');
  console.log('boucle infinie détectée');
};

var securiseScript = function securiseScript(s) {
  // secure boucle
  s = 'var secure_boucle = 5000; delete window.jour; delete window.nom_mois; delete window.annee; delete window.months; delete window.numero_du_mois; delete window.mois; delete window.padding; delete window.pad_jour; delete window.pad_mois; delete window.pad_annee; delete window.est_bissextile; delete window.compter_jour; delete window.nb_jours; delete window.ce_jour; delete window.ce_mois; delete window.cette_annee; delete window.jours_cette_annee; delete window.jours_restant_cette_annee; delete window.jours_depuis; delete window.jours_total_depuis_date;\n' + s;

  s = s.r('}', ';secure_boucle--;}');
  s = s.r('while\\((.*)\\)', 'while ($1 && secure_boucle-- > 0)');
  s = s.r('for\\((.*?);(.*?);(.*?)\\)', 'for($1;secure_boucle-- > 0 && $2;$3)');
  s = s + '\n\nif(secure_boucle <= 0) {warningBoucle();}';
  // replace var par window
  s = s.r('var ', 'window.');
  s = s.r('function ([a-zA-Z0-9_]+) ', 'window.$1 = function ');
  return s;
};

var superalgo = function superalgo(s) {

  // remove comments
  s = s.r('//.*', '');

  // variables
  s = s.r('LA VARIABLE ', 'var ');
  s = s.r('LE BOOLEEN ', 'var ');
  s = s.r('LE NOMBRE ', 'var ');
  s = s.r('LA CHAINE ', 'var ');
  s = s.r(' VAUT ', ' = ');
  s = s.r('FAUX', ' false ');
  s = s.r('VRAI', ' true ');

  // cast
  s = s.r('CHAINE[\s]*\\((.+?)\\)', ' ($1).toString() ');
  s = s.r('NOMBRE[\s]*\\((.+?)\\)', ' parseFloat($1) ');
  s = s.r('BOOLEEN[\s]*\\((.+?)\\)', ' Boolean($1) ');

  // tableaux
  s = s.r('LE TABLEAU ([a-z0-9_]+) CONTIENT (.+)', 'var $1 = [$2];');
  s = s.r('LE TABLEAU ([a-z0-9_]+)', 'var $1 = [];');
  s = s.r('AJOUTER (.+?) DANS ([a-z0-9_]+)', '$2.push($1);');
  s = s.r('TAILLE DE "([a-zA-Z0-9_]+)"', '"$1".length');
  s = s.r('TAILLE DE ([a-z0-9\\[\\]_]+)', '$1.length');
  s = s.r('RETIRER (.+?)\\[([0-9]+)\\]', '$1.splice($2,1)');
  s = s.r('([a-z0-9_]+) CONTIENT_IL (.+)', '($1.indexOf($2) !== -1)');

  // EXISTANCE
  s = s.r('EXISTE PAS ([a-z0-9_\\[\\]]]+)', ' (typeof $1 === "undefined") ');
  s = s.r(' ([a-z0-9_\\[\\]]]+) EXISTE PAS', ' (typeof $1 === "undefined") ');
  s = s.r('EXISTE ([a-z0-9_\\[\\]]+)', ' (typeof $1 !== "undefined") ');
  s = s.r(' ([a-z0-9_\\[\\]]+) EXISTE', ' (typeof $1 !== "undefined") ');

  // increment
  s = s.r('INCREMENTER (.*)', ' ++$1 ');
  s = s.r('DECREMENTER (.*)', ' --$1 ');

  // log
  s = s.r('AFFICHER (.+)', 'console.log($1) ');
  s = s.r('PUIS COLLER ', '+ "" +');
  s = s.r('PUIS ', '+ " " +');
  // s = s.r('ALERTER (.+)', 'window.alert($1) ');

  // conditionnel
  s = s.r('FIN SI', '}');
  s = s.r('SINON SI ([\\s\\S]+?)(?=ALORS|\\n)', '} else if ($1) ');
  s = s.r('SI ([\\s\\S]+?)(?=ALORS|\\n)', 'if ($1) ');
  s = s.r('ALORS', '{');
  s = s.r('SINON', '} else {');

  // operateurs
  s = s.r(' ET ', ' && ');
  s = s.r(' OU ', ' || ');
  s = s.r('NON ', ' ! ');
  s = s.r(' EST_PLUS_GRAND_QUE ', ' > ');
  s = s.r(' EST_PLUS_PETIT_QUE ', ' < ');
  s = s.r(' EST_PLUS_GRAND_OU_EGAL_A ', ' >= ');
  s = s.r(' EST_PLUS_PETIT_OU_EGAL_A ', ' <= ');
  s = s.r(' EST_EGALE_A ', ' == ');
  s = s.r(' EST_EGAL_A | EST ', ' == ');
  s = s.r(' EST_DIFFERENT_DE ', ' != ');
  s = s.r(' MOINS ', ' - ');
  s = s.r(' PLUS ', ' + ');
  s = s.r(' FOIS ', ' * ');
  s = s.r(' MODULO ', ' % ');
  s = s.r(' DIVISER_PAR ', ' / ');

  // fonction
  s = s.r('ALGORITHME ([a-z0-9_]+) AVEC (.+)', 'function $1 ( $2 )');
  s = s.r('ALGORITHME ([a-z0-9_]+)', 'function $1 ()');
  s = s.r('EXECUTER ([a-z0-9_]+) AVEC (.+)', '$1 ( $2 )');
  s = s.r('EXECUTER ([a-z0-9_]+)', '$1()');
  s = s.r('RENVOYER (.+)', 'return $1');

  // suite fonction
  s = s.r('FIN FAIRE', '}');
  // s = s.r('FIN CHAQUE', '}');
  s = s.r('FAIRE', '{');
  s = s.r('DEBUT', '{');
  s = s.r('FIN', '}');

  // boucles
  s = s.r('TANT QUE (.+)', 'while($1)');
  var forcode = 'for(var $1 = $2 ; ($2 < $3) ? $1 <= $3 : $1 >= $3; ($2 < $3) ? $1++ : $1--)';
  s = s.r('POUR ([a-z_]+) DE (.+) A (.+)', forcode);
  // const forcode2 = 'for(var index in $2) { \nvar $1 = $2[index];\n';
  // s = s.r('POUR CHAQUE ([a-z_]+) DE ([a-z_]+)[\\s]+{', forcode2);

  return s;
};

var evalResult = function evalResult(result) {
  try {
    window.logs = [];
    eval(securiseScript(result));
  } catch (e) {
    console.log('', '');
    console.log("Il y a une erreur dans votre algorythme :");
    console.log(e);
  }
};

var getArgs = function getArgs() {
  var re = new RegExp(/(\[[^\[\]]*\]|"[^"]*"|[^" ]+)(?:\s+|$)/, 'gmi');
  var parsedArgs = 'var p = [];\n';
  var rawArgs = $('#args').val().trim();
  if (!rawArgs) {
    return '';
  }
  var paramNum = 0;
  var match;
  if (rawArgs) {
    var match;
    while ((match = re.exec(rawArgs)) !== null) {
      var param = match[1];
      if (param === 'VRAI') {
        param = 'true';
      } else if (param === 'FAUX') {
        param = 'false';
      }
      if (typeof match[1] !== 'undefined') {
        // var param_${paramNum} = ${param};
        parsedArgs += 'var p' + paramNum + ' = ' + param + ';\np.push(' + param + ');\n';
        paramNum++;
      }
    }
  }
  return parsedArgs + "\n";
};

var initWork = function initWork(editor) {
  if (!isDemo) {
    localStorage.setItem('code', editor.getValue());
  }
  $('#terminal').html('');
  var result = superalgo(editor.getValue());
  var args = getArgs();
  var code = args + result;
  $('#code').html(code.replace(/\n\n+/g, '\n\n'));
  $('pre#code').each(function (i, block) {
    if (hljs) {
      hljs.highlightBlock(block);
    }
  });
  evalResult(code);
};

var codeMirrorConfig = [
// string
{
  regex: /"(?:[^\\]|\\.)*?(?:"|$)/,
  token: "jaune",
  ignoreForHint: true
},
/// tuto
{
  regex: /NOM BLOC|DEBUT BLOC|FIN BLOC/,
  token: "rouge",
  ignoreForHint: true
}, {
  regex: /CONDITION/,
  token: "cyan",
  ignoreForHint: true
}, {
  regex: /LA VARIABLE /,
  token: "cyan",
  ignoreForHint: true
},
/// real
// backup
// {
//   regex: /ALGORITHME |AVEC |SI |ALORS|DEBUT|SINON|FIN SI|FIN FAIRE|FIN|TANT QUE |FAIRE|POUR | DE | A |CHAQUE/,
//   token: "rouge"
// },
{
  regex: /LE NOMBRE |LA CHAINE |LE BOOLEEN |LE TABLEAU |NOMBRE|CHAINE|BOOLEEN/,
  token: "cyan"
}, {
  regex: /AJOUTER|RETIRER|TAILLE DE|DANS/,
  token: "rose"
}, {
  regex: / VAUT | CONTIENT |DECREMENTER |INCREMENTER /,
  token: "bleu"
}, {
  regex: /VRAI|FAUX/,
  token: "violet"
}, {
  regex: /AFFICHER | PUIS COLLER| PUIS|EXECUTER |RENVOYER /,
  token: "vert"
}, {
  regex: /SINON SI |FIN SI|FIN FAIRE|FIN/,
  token: "rouge",
  dedent: useIndent,
  dedentIfLineStart: true
}, {
  regex: /ALGORITHME |AVEC |SI |TANT QUE |POUR | DE | A /,
  token: "rouge"
}, {
  regex: /ALORS|DEBUT|FAIRE/,
  token: "rouge",
  indent: useIndent
}, {
  regex: /SINON/,
  token: "rouge",
  dedent: useIndent,
  indent: useIndent
}, {
  regex: /\/\/.*/,
  token: "comment",
  ignoreForHint: true
},
// c'est quoi déjà ?  :)
{
  regex: /\/(?:[^\\]|\\.)*?\//,
  token: "blanc",
  ignoreForHint: true
}, {
  regex: / ET | OU |NON /,
  token: "orange"
}, {
  regex: / MOINS | PLUS | FOIS | MODULO | DIVISER_PAR /,
  token: "orange"
}, {
  regex: / EST | CONTIENT_IL |EXISTE | EXISTE| EST_DIFFERENT_DE | EST_EGAL_A | EST_EGALE_A | EST_PLUS_PETIT_OU_EGAL_A | EST_PLUS_GRAND_OU_EGAL_A | EST_PLUS_PETIT_QUE | EST_PLUS_GRAND_QUE /,
  token: "orange"
},
// indent and dedent properties guide autoindentation
// {regex: /[ALORS]/, indent: true},
// {regex: /[\}\]\)]/, dedent: true},
// number
{
  regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i,
  token: "violet",
  ignoreForHint: true
}, {
  regex: /[a-z$][\w$]*/,
  token: "variable",
  ignoreForHint: true
}];

// AUTRE PLUGIN POUR MATCHER LE end tag
// (function () {
//   var Pos = CodeMirror.Pos;
//   function cmp(a, b) { return a.line - b.line || a.ch - b.ch; }

//   var nameStartChar = "A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
//   var nameChar = nameStartChar + "\-\:\.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040";
//   var xmlTagStart = new RegExp("<(/?)([" + nameStartChar + "][" + nameChar + "]*)", "g");

//   function Iter(cm, line, ch, range) {
//     this.line = line; this.ch = ch;
//     this.cm = cm; this.text = cm.getLine(line);
//     this.min = range ? Math.max(range.from, cm.firstLine()) : cm.firstLine();
//     this.max = range ? Math.min(range.to - 1, cm.lastLine()) : cm.lastLine();
//   }

//   function tagAt(iter, ch) {
//     var type = iter.cm.getTokenTypeAt(Pos(iter.line, ch));
//     return type && /\btag\b/.test(type);
//   }

//   function nextLine(iter) {
//     if (iter.line >= iter.max) return;
//     iter.ch = 0;
//     iter.text = iter.cm.getLine(++iter.line);
//     return true;
//   }
//   function prevLine(iter) {
//     if (iter.line <= iter.min) return;
//     iter.text = iter.cm.getLine(--iter.line);
//     iter.ch = iter.text.length;
//     return true;
//   }

//   function toTagEnd(iter) {
//     for (; ;) {
//       var gt = iter.text.indexOf(">", iter.ch);
//       if (gt == -1) { if (nextLine(iter)) continue; else return; }
//       if (!tagAt(iter, gt + 1)) { iter.ch = gt + 1; continue; }
//       var lastSlash = iter.text.lastIndexOf("/", gt);
//       var selfClose = lastSlash > -1 && !/\S/.test(iter.text.slice(lastSlash + 1, gt));
//       iter.ch = gt + 1;
//       return selfClose ? "selfClose" : "regular";
//     }
//   }
//   function toTagStart(iter) {
//     for (; ;) {
//       var lt = iter.ch ? iter.text.lastIndexOf("<", iter.ch - 1) : -1;
//       if (lt == -1) { if (prevLine(iter)) continue; else return; }
//       if (!tagAt(iter, lt + 1)) { iter.ch = lt; continue; }
//       xmlTagStart.lastIndex = lt;
//       iter.ch = lt;
//       var match = xmlTagStart.exec(iter.text);
//       if (match && match.index == lt) return match;
//     }
//   }

//   function toNextTag(iter) {
//     for (; ;) {
//       xmlTagStart.lastIndex = iter.ch;
//       var found = xmlTagStart.exec(iter.text);
//       if (!found) { if (nextLine(iter)) continue; else return; }
//       if (!tagAt(iter, found.index + 1)) { iter.ch = found.index + 1; continue; }
//       iter.ch = found.index + found[0].length;
//       return found;
//     }
//   }
//   function toPrevTag(iter) {
//     for (; ;) {
//       var gt = iter.ch ? iter.text.lastIndexOf(">", iter.ch - 1) : -1;
//       if (gt == -1) { if (prevLine(iter)) continue; else return; }
//       if (!tagAt(iter, gt + 1)) { iter.ch = gt; continue; }
//       var lastSlash = iter.text.lastIndexOf("/", gt);
//       var selfClose = lastSlash > -1 && !/\S/.test(iter.text.slice(lastSlash + 1, gt));
//       iter.ch = gt + 1;
//       return selfClose ? "selfClose" : "regular";
//     }
//   }

//   function findMatchingClose(iter, tag) {
//     var stack = [];
//     for (; ;) {
//       var next = toNextTag(iter), end, startLine = iter.line, startCh = iter.ch - (next ? next[0].length : 0);
//       if (!next || !(end = toTagEnd(iter))) return;
//       if (end == "selfClose") continue;
//       if (next[1]) { // closing tag
//         for (var i = stack.length - 1; i >= 0; --i) if (stack[i] == next[2]) {
//           stack.length = i;
//           break;
//         }
//         if (i < 0 && (!tag || tag == next[2])) return {
//           tag: next[2],
//           from: Pos(startLine, startCh),
//           to: Pos(iter.line, iter.ch)
//         };
//       } else { // opening tag
//         stack.push(next[2]);
//       }
//     }
//   }
//   function findMatchingOpen(iter, tag) {
//     var stack = [];
//     for (; ;) {
//       var prev = toPrevTag(iter);
//       if (!prev) return;
//       if (prev == "selfClose") { toTagStart(iter); continue; }
//       var endLine = iter.line, endCh = iter.ch;
//       var start = toTagStart(iter);
//       if (!start) return;
//       if (start[1]) { // closing tag
//         stack.push(start[2]);
//       } else { // opening tag
//         for (var i = stack.length - 1; i >= 0; --i) if (stack[i] == start[2]) {
//           stack.length = i;
//           break;
//         }
//         if (i < 0 && (!tag || tag == start[2])) return {
//           tag: start[2],
//           from: Pos(iter.line, iter.ch),
//           to: Pos(endLine, endCh)
//         };
//       }
//     }
//   }

//   CodeMirror.registerHelper("fold", "xml", function (cm, start) {
//     var iter = new Iter(cm, start.line, 0);
//     for (; ;) {
//       var openTag = toNextTag(iter), end;
//       if (!openTag || !(end = toTagEnd(iter)) || iter.line != start.line) return;
//       if (!openTag[1] && end != "selfClose") {
//         var startPos = Pos(iter.line, iter.ch);
//         var endPos = findMatchingClose(iter, openTag[2]);
//         return endPos && { from: startPos, to: endPos.from };
//       }
//     }
//   });
//   CodeMirror.findMatchingTag = function (cm, pos, range) {
//     var iter = new Iter(cm, pos.line, pos.ch, range);
//     if (iter.text.indexOf(">") == -1 && iter.text.indexOf("<") == -1) return;
//     var end = toTagEnd(iter), to = end && Pos(iter.line, iter.ch);
//     var start = end && toTagStart(iter);
//     if (!end || !start || cmp(iter, pos) > 0) return;
//     var here = { from: Pos(iter.line, iter.ch), to: to, tag: start[2] };
//     if (end == "selfClose") return { open: here, close: null, at: "open" };

//     if (start[1]) { // closing tag
//       return { open: findMatchingOpen(iter, start[2]), close: here, at: "close" };
//     } else { // opening tag
//       iter = new Iter(cm, to.line, to.ch, range);
//       return { open: here, close: findMatchingClose(iter, start[2]), at: "open" };
//     }
//   };

//   CodeMirror.findEnclosingTag = function (cm, pos, range, tag) {
//     var iter = new Iter(cm, pos.line, pos.ch, range);
//     for (; ;) {
//       var open = findMatchingOpen(iter, tag);
//       if (!open) break;
//       var forward = new Iter(cm, pos.line, pos.ch, range);
//       var close = findMatchingClose(forward, open.tag);
//       if (close) return { open: open, close: close };
//     }
//   };

//   // Used by addon/edit/closetag.js
//   CodeMirror.scanForClosingTag = function (cm, pos, name, end) {
//     var iter = new Iter(cm, pos.line, pos.ch, end ? { from: 0, to: end } : null);
//     return findMatchingClose(iter, name);
//   };
// })();


// (function() {
//   CodeMirror.defineOption("matchTags", false, function (cm, val, old) {
//     if (old && old != CodeMirror.Init) {
//       cm.off("cursorActivity", doMatchTags);
//       cm.off("viewportChange", maybeUpdateMatch);
//       clear(cm);
//     }
//     if (val) {
//       cm.state.matchBothTags = typeof val == "object" && val.bothTags;
//       cm.on("cursorActivity", doMatchTags);
//       cm.on("viewportChange", maybeUpdateMatch);
//       doMatchTags(cm);
//     }
//   });

//   function clear(cm) {
//     if (cm.state.tagHit) cm.state.tagHit.clear();
//     if (cm.state.tagOther) cm.state.tagOther.clear();
//     cm.state.tagHit = cm.state.tagOther = null;
//   }

//   function doMatchTags(cm) {
//     cm.state.failedTagMatch = false;
//     cm.operation(function () {
//       clear(cm);
//       if (cm.somethingSelected()) return;
//       var cur = cm.getCursor(), range = cm.getViewport();
//       range.from = Math.min(range.from, cur.line); range.to = Math.max(cur.line + 1, range.to);
//       var match = CodeMirror.findMatchingTag(cm, cur, range);
//       if (!match) return;
//       if (cm.state.matchBothTags) {
//         var hit = match.at == "open" ? match.open : match.close;
//         if (hit) cm.state.tagHit = cm.markText(hit.from, hit.to, { className: "CodeMirror-matchingtag" });
//       }
//       var other = match.at == "close" ? match.open : match.close;
//       if (other)
//         cm.state.tagOther = cm.markText(other.from, other.to, { className: "CodeMirror-matchingtag" });
//       else
//         cm.state.failedTagMatch = true;
//     });
//   }

//   function maybeUpdateMatch(cm) {
//     if (cm.state.failedTagMatch) doMatchTags(cm);
//   }

//   CodeMirror.commands.toMatchingTag = function (cm) {
//     var found = CodeMirror.findMatchingTag(cm, cm.getCursor());
//     if (found) {
//       var other = found.at == "close" ? found.open : found.close;
//       if (other) cm.extendSelection(other.to, other.from);
//     }
//   };
// })();


// PLUGIN TO MATCH ENDTAG WHEN selecting BEGIN one
// (function() => {
//   var defaults = {
//     style: "matchhighlight",
//     minChars: 2,
//     delay: 100,
//     wordsOnly: false,
//     annotateScrollbar: false,
//     showToken: false,
//     trim: true
//   }

//   function State(options) {
//     this.options = {}
//     for (var name in defaults)
//       this.options[name] = (options && options.hasOwnProperty(name) ? options : defaults)[name]
//     this.overlay = this.timeout = null;
//     this.matchesonscroll = null;
//     this.active = false;
//   }

//   CodeMirror.defineOption("highlightSelectionMatches", false, function (cm, val, old) {
//     if (old && old != CodeMirror.Init) {
//       removeOverlay(cm);
//       clearTimeout(cm.state.matchHighlighter.timeout);
//       cm.state.matchHighlighter = null;
//       cm.off("cursorActivity", cursorActivity);
//       cm.off("focus", onFocus)
//     }
//     if (val) {
//       var state = cm.state.matchHighlighter = new State(val);
//       if (cm.hasFocus()) {
//         state.active = true
//         highlightMatches(cm)
//       } else {
//         cm.on("focus", onFocus)
//       }
//       cm.on("cursorActivity", cursorActivity);
//     }
//   });

//   function cursorActivity(cm) {
//     var state = cm.state.matchHighlighter;
//     if (state.active || cm.hasFocus()) scheduleHighlight(cm, state)
//   }

//   function onFocus(cm) {
//     var state = cm.state.matchHighlighter
//     if (!state.active) {
//       state.active = true
//       scheduleHighlight(cm, state)
//     }
//   }

//   function scheduleHighlight(cm, state) {
//     clearTimeout(state.timeout);
//     state.timeout = setTimeout(function () { highlightMatches(cm); }, state.options.delay);
//   }

//   function addOverlay(cm, query, hasBoundary, style) {
//     var state = cm.state.matchHighlighter;
//     cm.addOverlay(state.overlay = makeOverlay(query, hasBoundary, style));
//     if (state.options.annotateScrollbar && cm.showMatchesOnScrollbar) {
//       var searchFor = hasBoundary ? new RegExp("\\b" + query + "\\b") : query;
//       state.matchesonscroll = cm.showMatchesOnScrollbar(searchFor, false,
//         { className: "CodeMirror-selection-highlight-scrollbar" });
//     }
//   }

//   function removeOverlay(cm) {
//     var state = cm.state.matchHighlighter;
//     if (state.overlay) {
//       cm.removeOverlay(state.overlay);
//       state.overlay = null;
//       if (state.matchesonscroll) {
//         state.matchesonscroll.clear();
//         state.matchesonscroll = null;
//       }
//     }
//   }

//   function highlightMatches(cm) {
//     cm.operation(function () {
//       var state = cm.state.matchHighlighter;
//       removeOverlay(cm);
//       if (!cm.somethingSelected() && state.options.showToken) {
//         var re = state.options.showToken === true ? /[\w$]/ : state.options.showToken;
//         var cur = cm.getCursor(), line = cm.getLine(cur.line), start = cur.ch, end = start;
//         while (start && re.test(line.charAt(start - 1)))--start;
//         while (end < line.length && re.test(line.charAt(end)))++end;
//         if (start < end)
//           addOverlay(cm, line.slice(start, end), re, state.options.style);
//         return;
//       }
//       var from = cm.getCursor("from"), to = cm.getCursor("to");
//       if (from.line != to.line) return;
//       if (state.options.wordsOnly && !isWord(cm, from, to)) return;
//       var selection = cm.getRange(from, to)
//       if (state.options.trim) selection = selection.replace(/^\s+|\s+$/g, "")
//       if (selection.length >= state.options.minChars)
//         addOverlay(cm, selection, false, state.options.style);
//     });
//   }

//   function isWord(cm, from, to) {
//     var str = cm.getRange(from, to);
//     if (str.match(/^\w+$/) !== null) {
//       if (from.ch > 0) {
//         var pos = { line: from.line, ch: from.ch - 1 };
//         var chr = cm.getRange(pos, from);
//         if (chr.match(/\W/) === null) return false;
//       }
//       if (to.ch < cm.getLine(from.line).length) {
//         var pos = { line: to.line, ch: to.ch + 1 };
//         var chr = cm.getRange(to, pos);
//         if (chr.match(/\W/) === null) return false;
//       }
//       return true;
//     } else return false;
//   }

//   function boundariesAround(stream, re) {
//     return (!stream.start || !re.test(stream.string.charAt(stream.start - 1))) &&
//       (stream.pos == stream.string.length || !re.test(stream.string.charAt(stream.pos)));
//   }

//   function makeOverlay(query, hasBoundary, style) {
//     return {
//       token: function (stream) {
//         if (stream.match(query) &&
//           (!hasBoundary || boundariesAround(stream, hasBoundary)))
//           return style;
//         stream.next();
//         stream.skipTo(query.charAt(0)) || stream.skipToEnd();
//       }
//     };
//   }
// }) ();


// {
//   regex: /CONDITION/,
//     token: "cyan",
//       ignoreForHint: true,
//   },


// const basicLanguageToken = new RegExp(
//   codeMirrorConfig.reduce((prev, current) => {
//     if (!current.ignoreForHint) {
//       prev += '|' + current.regex.source;
//     }
//     return prev += '';
//   }, '')
// );
/////////////////////////////////
///// show hint
/////////////////////////////////
// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function (mod) {
  if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) == "object" && (typeof module === 'undefined' ? 'undefined' : _typeof(module)) == "object") // CommonJS
    mod(require("../../lib/codemirror"));else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);else // Plain browser env
    mod(CodeMirror);
})(function (CodeMirror) {
  "use strict";

  var HINT_ELEMENT_CLASS = "CodeMirror-hint";
  var ACTIVE_HINT_ELEMENT_CLASS = "CodeMirror-hint-active";

  // This is the old interface, kept around for now to stay
  // backwards-compatible.
  CodeMirror.showHint = function (cm, getHints, options) {
    if (!getHints) return cm.showHint(options);
    if (options && options.async) getHints.async = true;
    var newOpts = { hint: getHints };
    if (options) for (var prop in options) {
      newOpts[prop] = options[prop];
    }return cm.showHint(newOpts);
  };

  CodeMirror.defineExtension("showHint", function (options) {
    options = parseOptions(this, this.getCursor("start"), options);
    var selections = this.listSelections();
    if (selections.length > 1) return;
    // By default, don't allow completion when something is selected.
    // A hint function can have a `supportsSelection` property to
    // indicate that it can handle selections.
    if (this.somethingSelected()) {
      if (!options.hint.supportsSelection) return;
      // Don't try with cross-line selections
      for (var i = 0; i < selections.length; i++) {
        if (selections[i].head.line != selections[i].anchor.line) return;
      }
    }

    if (this.state.completionActive) this.state.completionActive.close();
    var completion = this.state.completionActive = new Completion(this, options);
    if (!completion.options.hint) return;

    CodeMirror.signal(this, "startCompletion", this);
    completion.update(true);
  });

  function Completion(cm, options) {
    this.cm = cm;
    this.options = options;
    this.widget = null;
    this.debounce = 0;
    this.tick = 0;
    this.startPos = this.cm.getCursor("start");
    this.startLen = this.cm.getLine(this.startPos.line).length - this.cm.getSelection().length;

    var self = this;
    cm.on("cursorActivity", this.activityFunc = function () {
      self.cursorActivity();
    });
  }

  var requestAnimationFrame = window.requestAnimationFrame || function (fn) {
    return setTimeout(fn, 1000 / 60);
  };
  var cancelAnimationFrame = window.cancelAnimationFrame || clearTimeout;

  Completion.prototype = {
    close: function close() {
      if (!this.active()) return;
      this.cm.state.completionActive = null;
      this.tick = null;
      this.cm.off("cursorActivity", this.activityFunc);

      if (this.widget && this.data) CodeMirror.signal(this.data, "close");
      if (this.widget) this.widget.close();
      CodeMirror.signal(this.cm, "endCompletion", this.cm);
    },

    active: function active() {
      return this.cm.state.completionActive == this;
    },

    pick: function pick(data, i) {
      var completion = data.list[i];
      if (completion.hint) completion.hint(this.cm, data, completion);else this.cm.replaceRange(getText(completion), completion.from || data.from, completion.to || data.to, "complete");
      CodeMirror.signal(data, "pick", completion);
      this.close();
      // custom
      this.cm.execCommand('reindent');
      // fin custom
    },

    cursorActivity: function cursorActivity() {
      if (this.debounce) {
        cancelAnimationFrame(this.debounce);
        this.debounce = 0;
      }

      var pos = this.cm.getCursor(),
          line = this.cm.getLine(pos.line);
      if (pos.line != this.startPos.line || line.length - pos.ch != this.startLen - this.startPos.ch || pos.ch < this.startPos.ch || this.cm.somethingSelected() || pos.ch && this.options.closeCharacters.test(line.charAt(pos.ch - 1))) {
        this.close();
      } else {
        var self = this;
        this.debounce = requestAnimationFrame(function () {
          self.update();
        });
        if (this.widget) this.widget.disable();
      }
    },

    update: function update(first) {
      if (this.tick == null) return;
      var self = this,
          myTick = ++this.tick;
      fetchHints(this.options.hint, this.cm, this.options, function (data) {
        if (self.tick == myTick) self.finishUpdate(data, first);
      });
    },

    finishUpdate: function finishUpdate(data, first) {
      if (this.data) CodeMirror.signal(this.data, "update");

      var picked = this.widget && this.widget.picked || first && this.options.completeSingle;
      if (this.widget) this.widget.close();

      this.data = data;

      if (data && data.list.length) {
        if (picked && data.list.length == 1) {
          this.pick(data, 0);
        } else {
          this.widget = new Widget(this, data);
          CodeMirror.signal(data, "shown");
        }
      }
    }
  };

  function parseOptions(cm, pos, options) {
    var editor = cm.options.hintOptions;
    var out = {};
    for (var prop in defaultOptions) {
      out[prop] = defaultOptions[prop];
    }if (editor) for (var prop in editor) {
      if (editor[prop] !== undefined) out[prop] = editor[prop];
    }if (options) for (var prop in options) {
      if (options[prop] !== undefined) out[prop] = options[prop];
    }if (out.hint.resolve) out.hint = out.hint.resolve(cm, pos);
    return out;
  }

  function getText(completion) {
    if (typeof completion == "string") return completion;else return completion.text;
  }

  function buildKeyMap(completion, handle) {
    var baseMap = {
      Up: function Up() {
        handle.moveFocus(-1);
      },
      Down: function Down() {
        handle.moveFocus(1);
      },
      PageUp: function PageUp() {
        handle.moveFocus(-handle.menuSize() + 1, true);
      },
      PageDown: function PageDown() {
        handle.moveFocus(handle.menuSize() - 1, true);
      },
      Home: function Home() {
        handle.setFocus(0);
      },
      End: function End() {
        handle.setFocus(handle.length - 1);
      },
      Enter: handle.pick,
      Tab: handle.pick,
      Esc: handle.close
    };
    var custom = completion.options.customKeys;
    var ourMap = custom ? {} : baseMap;
    function addBinding(key, val) {
      var bound;
      if (typeof val != "string") bound = function bound(cm) {
        return val(cm, handle);
      };
      // This mechanism is deprecated
      else if (baseMap.hasOwnProperty(val)) bound = baseMap[val];else bound = val;
      ourMap[key] = bound;
    }
    if (custom) for (var key in custom) {
      if (custom.hasOwnProperty(key)) addBinding(key, custom[key]);
    }var extra = completion.options.extraKeys;
    if (extra) for (var key in extra) {
      if (extra.hasOwnProperty(key)) addBinding(key, extra[key]);
    }return ourMap;
  }

  function getHintElement(hintsElement, el) {
    while (el && el != hintsElement) {
      if (el.nodeName.toUpperCase() === "LI" && el.parentNode == hintsElement) return el;
      el = el.parentNode;
    }
  }

  function Widget(completion, data) {
    this.completion = completion;
    this.data = data;
    this.picked = false;
    var widget = this,
        cm = completion.cm;

    var hints = this.hints = document.createElement("ul");
    hints.className = "CodeMirror-hints";
    this.selectedHint = data.selectedHint || 0;

    var completions = data.list;
    for (var i = 0; i < completions.length; ++i) {
      var elt = hints.appendChild(document.createElement("li")),
          cur = completions[i];
      var className = HINT_ELEMENT_CLASS + (i != this.selectedHint ? "" : " " + ACTIVE_HINT_ELEMENT_CLASS);
      if (cur.className != null) className = cur.className + " " + className;
      elt.className = className;
      if (cur.render) cur.render(elt, data, cur);else elt.appendChild(document.createTextNode(cur.displayText || getText(cur)));
      elt.hintId = i;
    }

    var pos = cm.cursorCoords(completion.options.alignWithWord ? data.from : null);
    var left = pos.left,
        top = pos.bottom,
        below = true;
    hints.style.left = left + "px";
    hints.style.top = top + "px";
    // If we're at the edge of the screen, then we want the menu to appear on the left of the cursor.
    var winW = window.innerWidth || Math.max(document.body.offsetWidth, document.documentElement.offsetWidth);
    var winH = window.innerHeight || Math.max(document.body.offsetHeight, document.documentElement.offsetHeight);
    (completion.options.container || document.body).appendChild(hints);
    var box = hints.getBoundingClientRect(),
        overlapY = box.bottom - winH;
    var scrolls = hints.scrollHeight > hints.clientHeight + 1;
    var startScroll = cm.getScrollInfo();

    if (overlapY > 0) {
      var height = box.bottom - box.top,
          curTop = pos.top - (pos.bottom - box.top);
      if (curTop - height > 0) {
        // Fits above cursor
        hints.style.top = (top = pos.top - height) + "px";
        below = false;
      } else if (height > winH) {
        hints.style.height = winH - 5 + "px";
        hints.style.top = (top = pos.bottom - box.top) + "px";
        var cursor = cm.getCursor();
        if (data.from.ch != cursor.ch) {
          pos = cm.cursorCoords(cursor);
          hints.style.left = (left = pos.left) + "px";
          box = hints.getBoundingClientRect();
        }
      }
    }
    var overlapX = box.right - winW;
    if (overlapX > 0) {
      if (box.right - box.left > winW) {
        hints.style.width = winW - 5 + "px";
        overlapX -= box.right - box.left - winW;
      }
      hints.style.left = (left = pos.left - overlapX) + "px";
    }
    if (scrolls) for (var node = hints.firstChild; node; node = node.nextSibling) {
      node.style.paddingRight = cm.display.nativeBarWidth + "px";
    }cm.addKeyMap(this.keyMap = buildKeyMap(completion, {
      moveFocus: function moveFocus(n, avoidWrap) {
        widget.changeActive(widget.selectedHint + n, avoidWrap);
      },
      setFocus: function setFocus(n) {
        widget.changeActive(n);
      },
      menuSize: function menuSize() {
        return widget.screenAmount();
      },
      length: completions.length,
      close: function close() {
        completion.close();
      },
      pick: function pick() {
        widget.pick();
      },
      data: data
    }));

    if (completion.options.closeOnUnfocus) {
      var closingOnBlur;
      cm.on("blur", this.onBlur = function () {
        closingOnBlur = setTimeout(function () {
          completion.close();
        }, 100);
      });
      cm.on("focus", this.onFocus = function () {
        clearTimeout(closingOnBlur);
      });
    }

    cm.on("scroll", this.onScroll = function () {
      var curScroll = cm.getScrollInfo(),
          editor = cm.getWrapperElement().getBoundingClientRect();
      var newTop = top + startScroll.top - curScroll.top;
      var point = newTop - (window.pageYOffset || (document.documentElement || document.body).scrollTop);
      if (!below) point += hints.offsetHeight;
      if (point <= editor.top || point >= editor.bottom) return completion.close();
      hints.style.top = newTop + "px";
      hints.style.left = left + startScroll.left - curScroll.left + "px";
    });

    CodeMirror.on(hints, "dblclick", function (e) {
      var t = getHintElement(hints, e.target || e.srcElement);
      if (t && t.hintId != null) {
        widget.changeActive(t.hintId);widget.pick();
      }
    });

    CodeMirror.on(hints, "click", function (e) {
      var t = getHintElement(hints, e.target || e.srcElement);
      if (t && t.hintId != null) {
        widget.changeActive(t.hintId);
        if (completion.options.completeOnSingleClick) widget.pick();
      }
    });

    CodeMirror.on(hints, "mousedown", function () {
      setTimeout(function () {
        cm.focus();
      }, 20);
    });

    CodeMirror.signal(data, "select", completions[this.selectedHint], hints.childNodes[this.selectedHint]);
    return true;
  }

  Widget.prototype = {
    close: function close() {
      if (this.completion.widget != this) return;
      this.completion.widget = null;
      this.hints.parentNode.removeChild(this.hints);
      this.completion.cm.removeKeyMap(this.keyMap);

      var cm = this.completion.cm;
      if (this.completion.options.closeOnUnfocus) {
        cm.off("blur", this.onBlur);
        cm.off("focus", this.onFocus);
      }
      cm.off("scroll", this.onScroll);
    },

    disable: function disable() {
      this.completion.cm.removeKeyMap(this.keyMap);
      var widget = this;
      this.keyMap = { Enter: function Enter() {
          widget.picked = true;
        } };
      this.completion.cm.addKeyMap(this.keyMap);
    },

    pick: function pick() {
      this.completion.pick(this.data, this.selectedHint);
    },

    changeActive: function changeActive(i, avoidWrap) {
      if (i >= this.data.list.length) i = avoidWrap ? this.data.list.length - 1 : 0;else if (i < 0) i = avoidWrap ? 0 : this.data.list.length - 1;
      if (this.selectedHint == i) return;
      var node = this.hints.childNodes[this.selectedHint];
      node.className = node.className.replace(" " + ACTIVE_HINT_ELEMENT_CLASS, "");
      node = this.hints.childNodes[this.selectedHint = i];
      node.className += " " + ACTIVE_HINT_ELEMENT_CLASS;
      if (node.offsetTop < this.hints.scrollTop) this.hints.scrollTop = node.offsetTop - 3;else if (node.offsetTop + node.offsetHeight > this.hints.scrollTop + this.hints.clientHeight) this.hints.scrollTop = node.offsetTop + node.offsetHeight - this.hints.clientHeight + 3;
      CodeMirror.signal(this.data, "select", this.data.list[this.selectedHint], node);
    },

    screenAmount: function screenAmount() {
      return Math.floor(this.hints.clientHeight / this.hints.firstChild.offsetHeight) || 1;
    }
  };

  function applicableHelpers(cm, helpers) {
    if (!cm.somethingSelected()) return helpers;
    var result = [];
    for (var i = 0; i < helpers.length; i++) {
      if (helpers[i].supportsSelection) result.push(helpers[i]);
    }return result;
  }

  function fetchHints(hint, cm, options, callback) {
    if (hint.async) {
      hint(cm, callback, options);
    } else {
      var result = hint(cm, options);
      if (result && result.then) result.then(callback);else callback(result);
    }
  }

  function resolveAutoHints(cm, pos) {
    var helpers = cm.getHelpers(pos, "hint"),
        words;
    if (helpers.length) {
      var resolved = function resolved(cm, callback, options) {
        var app = applicableHelpers(cm, helpers);
        function run(i) {
          if (i == app.length) return callback(null);
          fetchHints(app[i], cm, options, function (result) {
            if (result && result.list.length > 0) callback(result);else run(i + 1);
          });
        }
        run(0);
      };
      resolved.async = true;
      resolved.supportsSelection = true;
      return resolved;
    } else if (words = cm.getHelper(cm.getCursor(), "hintWords")) {
      return function (cm) {
        return CodeMirror.hint.fromList(cm, { words: words });
      };
    } else if (CodeMirror.hint.anyword) {
      return function (cm, options) {
        return CodeMirror.hint.anyword(cm, options);
      };
    } else {
      return function () {};
    }
  }

  CodeMirror.registerHelper("hint", "auto", {
    resolve: resolveAutoHints
  });

  CodeMirror.registerHelper("hint", "fromList", function (cm, options) {
    var cur = cm.getCursor(),
        token = cm.getTokenAt(cur);
    var to = CodeMirror.Pos(cur.line, token.end);
    if (token.string && /\w/.test(token.string[token.string.length - 1])) {
      var term = token.string,
          from = CodeMirror.Pos(cur.line, token.start);
    } else {
      var term = "",
          from = to;
    }
    var found = [];
    for (var i = 0; i < options.words.length; i++) {
      var word = options.words[i];
      if (word.slice(0, term.length) == term) found.push(word);
    }

    if (found.length) return { list: found, from: from, to: to };
  });

  CodeMirror.commands.autocomplete = CodeMirror.showHint;

  var defaultOptions = {
    hint: CodeMirror.hint.auto,
    completeSingle: true,
    alignWithWord: true,
    closeCharacters: /[\s()\[\]{};:>,]/,
    closeOnUnfocus: true,
    completeOnSingleClick: true,
    container: null,
    customKeys: null,
    extraKeys: null
  };

  CodeMirror.defineOption("hintOptions", null);
});
/////////////////////////////////
///// fin show hint
/////////////////////////////////


// Custom Show Invisible Plugin
(function () {
  CodeMirror.defineOption('showInvisibles', false, function (cm, val, prev) {
    var Count = 0;
    var Maximum = cm.getOption('maxInvisibles') || 25;

    if (prev === CodeMirror.Init) {
      prev = false;
    }

    if (prev && !val) {
      cm.removeOverlay('invisibles');
      return rm();
    }

    if (!prev && val) {
      add(Maximum);

      cm.addOverlay({
        name: 'invisibles',
        token: function nextToken(stream) {
          var spaces = 0;
          var peek = stream.peek() === ' ';

          if (peek) {
            while (peek && spaces < Maximum) {
              ++spaces;

              stream.next();
              peek = stream.peek() === ' ';
            }

            var ret = 'whitespace whitespace-' + spaces;

            /*
             * styles should be different
             * could not be two same styles
             * beside because of this check in runmode
             * function in `codemirror.js`:
             *
             * 6624: if (!flattenSpans || curStyle != style) {}
             */
            if (spaces === Maximum) {
              ret += ' whitespace-rand-' + Count++;
            }

            return ret;
          }

          while (!stream.eol() && !peek) {
            stream.next();

            peek = stream.peek() === ' ';
          }

          return 'cm-eol';
        }
      });
    }
  });

  function add(max) {
    var classBase = '.CodeMirror .cm-whitespace-';
    var spaceChar = '·';
    var style = document.createElement('style');

    style.setAttribute('data-name', 'js-show-invisibles');

    var rules = '';
    var spaceChars = '';

    for (var i = 1; i <= max; ++i) {
      spaceChars += spaceChar;

      var rule = classBase + i + '::before { content: "' + spaceChars + '";}\n';
      rules += rule;
    }

    style.textContent = getStyle() + '\n' + rules;

    document.head.appendChild(style);
  }

  function rm() {
    var style = document.querySelector('[data-name="js-show-invisibles"]');

    document.head.removeChild(style);
  }

  function getStyle() {
    var style = ['.cm-whitespace::before {', '  position: absolute;', '  pointer-events: none;', '  color: #404F7D;', '  margin-left: -1px;', '}', '.cm-cm-eol + .cm-whitespace::before {', '  opacity: 0;', '}'].join('');

    return style;
  }
})();

// list of all tokens in an array
var tokenWord = [];
var basicLanguageToken = codeMirrorConfig.reduce(function (prev, current) {
  if (!current.ignoreForHint) {
    var elems = current.regex.source.split('|');
    elems.forEach(function (e) {
      prev.push(e.trim() + ' ');
      // manage word tokens here
      e.split(' ').forEach(function (t) {
        var toAdd = t.trim();
        if (toAdd && tokenWord.indexOf(toAdd) === -1) {
          tokenWord.push(toAdd);
        }
      });
      // end manage word tokens
    });
  }
  return prev;
}, []);

var snippets = [{
  displayText: 'snippet: SI ALORS SINON',
  text: 'SI bool\nALORS\n\nSINON\n\nFIN SI'
}, {
  displayText: 'snippet: SI SINON SI',
  text: 'SI bool\nALORS\n\nSINON SI bool\nALORS\n\nSINON\n\nFIN SI'
}, {
  displayText: 'snippet: TANT QUE',
  text: 'TANT QUE bool\nFAIRE\n\nFIN FAIRE'
}, {
  displayText: 'snippet: POUR',
  text: 'POUR … DE … A …\nFAIRE\n\nFIN FAIRE'
}, {
  displayText: 'snippet: ALGORITHME',
  text: 'ALGORITHME nom_algo\nDEBUT\n\nFIN'
}, {
  displayText: 'snippet: ALGORITHME & params',
  text: 'ALGORITHME nom_algo AVEC param1, param2\nDEBUT\n\nFIN'
}];

// register helper for autocomplete
CodeMirror.registerHelper("hint", "algo", function (editor, options) {
  var WORD = /["\w$]+/;
  var RANGE = 500;

  var word = options && options.word || WORD;
  var range = options && options.range || RANGE;
  var cur = editor.getCursor(),
      curLine = editor.getLine(cur.line);
  var end = cur.ch,
      start = end;
  while (start && word.test(curLine.charAt(start - 1))) {
    --start;
  }var curWord = start != end && curLine.slice(start, end);

  var list = options && options.list || [],
      seen = {};
  var re = new RegExp(word.source, "g");
  for (var dir = -1; dir <= 1; dir += 2) {
    var line = cur.line,
        endLine = Math.min(Math.max(line + dir * range, editor.firstLine()), editor.lastLine()) + dir;
    for (; line != endLine; line += dir) {
      var text = editor.getLine(line),
          m;
      while (m = re.exec(text)) {
        if (line == cur.line && m[0] === curWord) continue;
        if ((!curWord || m[0].lastIndexOf(curWord, 0) == 0) && !Object.prototype.hasOwnProperty.call(seen, m[0])) {
          seen[m[0]] = true;
          if (typeof m[0] === 'string' && m[0].startsWith('"')) continue;
          if (tokenWord.indexOf(m[0]) === -1) {
            list.push(m[0]);
          }
        }
      }
    }
  }
  if (curWord) {
    var _list;

    (_list = list).push.apply(_list, _toConsumableArray(basicLanguageToken.filter(function (token) {
      return token.includes(curWord);
    })));
    list = list.concat(snippets.filter(function (snip) {
      return snip.displayText.includes(curWord);
    }));
  } else {
    var _list2;

    list = list.concat(snippets);
    (_list2 = list).push.apply(_list2, _toConsumableArray(basicLanguageToken));
  }
  return {
    list: list,
    from: CodeMirror.Pos(cur.line, start),
    to: CodeMirror.Pos(cur.line, end)
  };
});

// reindent et replace le curseur
CodeMirror.commands.reindent = function (cm) {
  var cursor = cm.getCursor();
  console.log(cursor);
  var currentLineLength = cm.doc.children[0].lines[cursor.line].text.length;
  reindenter();
  cm.setCursor(cursor);
  var newLineLength = cm.doc.children[0].lines[cursor.line].text.length;
  var posChange = currentLineLength - newLineLength;
  if (posChange !== 0) {
    cursor.ch -= posChange;
    cm.setCursor(cursor);
  }
};

CodeMirror.commands.tabToSpace = function (cm) {
  if (cm.doc.getSelection().length === 0) {
    cm.replaceSelection('  ');
  } else {
    cm.execCommand('indentMore');
  }
};
CodeMirror.commands.autocomplete = function (cm) {
  cm.showHint({ hint: CodeMirror.hint.algo });
};

CodeMirror.defineSimpleMode("simplemode", {
  start: codeMirrorConfig,
  meta: {
    dontIndentStates: ["comment"],
    lineComment: "//",
    electricInput: /\s*(FIN|SINON)$/
  }
});

var editor = CodeMirror.fromTextArea(document.getElementById('algo'), {
  lineNumbers: true,
  indentUnit: 2,
  tabSize: 2,
  smartIndent: useIndent,
  theme: 'monokai',
  highlightSelectionMatches: true,
  showInvisibles: true,
  extraKeys: {
    "Ctrl-Space": "autocomplete",
    "Ctrl-N": "autocomplete",
    "Ctrl-I": "reindent",
    "Tab": "tabToSpace"
  }
});

var reindenter = function reindenter() {
  var base = editor.getValue();
  base = base.r('\t', ' ');
  base = base.r('SI (.+) ALORS', 'SI $1\nALORS');
  var lines = base.split('\n');
  var level = '';
  lines.forEach(function (line, i) {
    line = line.r('^[ ]*', '');
    if (line.bw('ALORS') || line.bw('FAIRE') || line.bw('DEBUT')) {
      line = level + line;
      level += '  ';
    } else if (line.bw('FIN')) {
      level = level.substring(0, level.length - 2);
      line = level + line;
    } else if (line.bw('SINON SI')) {
      level = level.substring(0, level.length - 2);
      line = level + line;
    } else if (line.bw('SINON')) {
      level = level.substring(0, level.length - 2);
      line = level + line;
      level += '  ';
    } else {
      line = level + line;
    }
    lines[i] = line;
  });
  editor.setValue(lines.join('\n'));
  if (!isDemo) {
    localStorage.setItem('code', editor.getValue());
  }
};
$('#reindent').on('click', reindenter);

editor.on('change', initWork.bind(null, editor));
$('#args').on('input', initWork.bind(null, editor));
$('#codebox_visibility').on('click', function () {
  if ($(this).is(':checked')) {
    $('#codebox').show();
    $('#exec_box').hide();
  } else {
    $('#codebox').hide();
    $('#exec_box').show();
  }
});
$('#prompt_visibility').on('click', function () {
  if ($(this).is(':checked')) {
    $('#prompt').show();
  } else {
    $('#prompt').hide();
  }
});

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
$('#download').on('click', function (e) {
  download('mon_nom.algo', editor.getValue());
});

function loadSavedCode() {
  var savedCode = localStorage.getItem('code');
  console.warn('savedCode found :');
  console.warn(savedCode);
  // si on est pas dans un cas prérempli
  if (savedCode) {
    editor.setValue(savedCode);
    initWork(editor);
  }
}

if (!isDemo) {
  loadSavedCode();
}

initWork(editor);
$('#codebox').hide();

document.body.style.color = 'black';
