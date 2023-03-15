// when animating on canvas, it is best to use requestAnimationFrame instead of setTimeout or setInterval
// not supported in all browsers though and sometimes needs a prefix, so we need a shim
window.requestAnimFrame = (function () {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

// now we will setup our basic variables for the demo
var canvas = document.getElementById('canvas'),
  ctx = canvas.getContext('2d'),
  // full screen dimensions
  cw = window.innerWidth,
  ch = window.innerHeight,
  // firework collection
  fireworks = [],
  // particle collection
  particles = [],
  // starting hue
  hue = 120,
  // when launching fireworks with a click, too many get launched at once without a limiter, one launch per 5 loop ticks
  limiterTotal = 0,
  limiterTick = 0,
  // this will time the auto launches of fireworks, one launch per 80 loop ticks
  timerTotal = 25,
  timerTick = 0,
  mousedown = false,
  // mouse x coordinate,
  mx,
  // mouse y coordinate
  my;

// set canvas dimensions
canvas.width = cw;
canvas.height = ch;

// now we are going to setup our function placeholders for the entire demo

// get a random number within a range
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// calculate the distance between two points
function calculateDistance(p1x, p1y, p2x, p2y) {
  var xDistance = p1x - p2x,
    yDistance = p1y - p2y;
  return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

// create firework
function Firework(sx, sy, tx, ty) {
  // actual coordinates
  this.x = sx;
  this.y = sy;
  // starting coordinates
  this.sx = sx;
  this.sy = sy;
  // target coordinates
  this.tx = tx;
  this.ty = ty;
  // distance from starting point to target
  this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
  this.distanceTraveled = 0;
  // track the past coordinates of each firework to create a trail effect, increase the coordinate count to create more prominent trails
  this.coordinates = [];
  this.coordinateCount = 3;
  // populate initial coordinate collection with the current coordinates
  while (this.coordinateCount--) {
    this.coordinates.push([this.x, this.y]);
  }
  this.angle = Math.atan2(ty - sy, tx - sx);
  this.speed = 2;
  this.acceleration = 1.05;
  this.brightness = random(50, 70);
  // circle target indicator radius
  this.targetRadius = 0;
}

// update firework
Firework.prototype.update = function (index) {
  // remove last item in coordinates array
  this.coordinates.pop();
  // add current coordinates to the start of the array
  this.coordinates.unshift([this.x, this.y]);

  // cycle the circle target indicator radius
  if (this.targetRadius < 8) {
    this.targetRadius += 0.3;
  } else {
    this.targetRadius = 1;
  }

  // speed up the firework
  this.speed *= this.acceleration;

  // get the current velocities based on angle and speed
  var vx = Math.cos(this.angle) * this.speed,
    vy = Math.sin(this.angle) * this.speed;
  // how far will the firework have traveled with velocities applied?
  this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);

  // if the distance traveled, including velocities, is greater than the initial distance to the target, then the target has been reached
  if (this.distanceTraveled >= this.distanceToTarget) {
    createParticles(this.tx, this.ty);
    // remove the firework, use the index passed into the update function to determine which to remove
    fireworks.splice(index, 1);
  } else {
    // target not reached, keep traveling
    this.x += vx;
    this.y += vy;
  }
}

// draw firework
Firework.prototype.draw = function () {
  ctx.beginPath();
  // move to the last tracked coordinate in the set, then draw a line to the current x and y
  ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
  ctx.lineTo(this.x, this.y);
  ctx.strokeStyle = 'hsl(' + hue + ', 100%, ' + this.brightness + '%)';
  ctx.stroke();

  ctx.beginPath();
  // draw the target for this firework with a pulsing circle
  //	ctx.arc( this.tx, this.ty, this.targetRadius, 0, Math.PI * 2 );
  ctx.stroke();
}

// create particle
function Particle(x, y) {
  this.x = x;
  this.y = y;
  // track the past coordinates of each particle to create a trail effect, increase the coordinate count to create more prominent trails
  this.coordinates = [];
  this.coordinateCount = 5;
  while (this.coordinateCount--) {
    this.coordinates.push([this.x, this.y]);
  }
  // set a random angle in all possible directions, in radians
  this.angle = random(0, Math.PI * 2);
  this.speed = random(1, 10);
  // friction will slow the particle down
  this.friction = 0.95;
  // gravity will be applied and pull the particle down
  this.gravity = 1;
  // set the hue to a random number +-50 of the overall hue variable
  this.hue = random(hue - 50, hue + 50);
  this.brightness = random(50, 80);
  this.alpha = 1;
  // set how fast the particle fades out
  this.decay = random(0.015, 0.03);
}

// update particle
Particle.prototype.update = function (index) {
  // remove last item in coordinates array
  this.coordinates.pop();
  // add current coordinates to the start of the array
  this.coordinates.unshift([this.x, this.y]);
  // slow down the particle
  this.speed *= this.friction;
  // apply velocity
  this.x += Math.cos(this.angle) * this.speed;
  this.y += Math.sin(this.angle) * this.speed + this.gravity;
  // fade out the particle
  this.alpha -= this.decay;

  // remove the particle once the alpha is low enough, based on the passed in index
  if (this.alpha <= this.decay) {
    particles.splice(index, 1);
  }
}

// draw particle
Particle.prototype.draw = function () {
  ctx.beginPath();
  // move to the last tracked coordinates in the set, then draw a line to the current x and y
  ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
  ctx.lineTo(this.x, this.y);
  ctx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
  ctx.stroke();
}

// create particle group/explosion
function createParticles(x, y) {
  // increase the particle count for a bigger explosion, beware of the canvas performance hit with the increased particles though
  var particleCount = 30;
  while (particleCount--) {
    particles.push(new Particle(x, y));
  }
}

// main demo loop
function loop() {
  // this function will run endlessly with requestAnimationFrame
  requestAnimFrame(loop);

  // increase the hue to get different colored fireworks over time
  //hue += 0.5;

  // create random color
  hue = random(0, 360);

  // normally, clearRect() would be used to clear the canvas
  // we want to create a trailing effect though
  // setting the composite operation to destination-out will allow us to clear the canvas at a specific opacity, rather than wiping it entirely
  ctx.globalCompositeOperation = 'destination-out';
  // decrease the alpha property to create more prominent trails
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, cw, ch);
  // change the composite operation back to our main mode
  // lighter creates bright highlight points as the fireworks and particles overlap each other
  ctx.globalCompositeOperation = 'lighter';

  // loop over each firework, draw it, update it
  var i = fireworks.length;
  while (i--) {
    fireworks[i].draw();
    fireworks[i].update(i);
  }

  // loop over each particle, draw it, update it
  var i = particles.length;
  while (i--) {
    particles[i].draw();
    particles[i].update(i);
  }

  // launch fireworks automatically to random coordinates, when the mouse isn't down
  if (timerTick >= timerTotal) {
    if (!mousedown) {
      // start the firework at the bottom middle of the screen, then set the random target coordinates, the random y coordinates will be set within the range of the top half of the screen
      fireworks.push(new Firework(cw / 2, ch, random(0, cw), random(0, ch / 2)));
      timerTick = 0;
    }
  } else {
    timerTick++;
  }

  // limit the rate at which fireworks get launched when mouse is down
  if (limiterTick >= limiterTotal) {
    if (mousedown) {
      // start the firework at the bottom middle of the screen, then set the current mouse coordinates as the target
      fireworks.push(new Firework(cw / 2, ch, mx, my));
      limiterTick = 0;
    }
  } else {
    limiterTick++;
  }
}

// mouse event bindings
// update the mouse coordinates on mousemove
canvas.addEventListener('mousemove', function (e) {
  mx = e.pageX - canvas.offsetLeft;
  my = e.pageY - canvas.offsetTop;
});

// toggle mousedown state and prevent canvas from being selected
canvas.addEventListener('mousedown', function (e) {
  e.preventDefault();
  mousedown = true;
});

canvas.addEventListener('mouseup', function (e) {
  e.preventDefault();
  mousedown = false;
});























function reset(){};
function afficher_resultat(){};
function get_operateur(){};
function get_chiffre(){};
function calculer(){};
function calculer_et_afficher(){};

// function writeDebug() { };

const
  MULTI = 0,
  DIVI = 1,
  ADD = 2,
  SOUS = 3,
  C7 = 1,
  C8 = 2,
  C9 = 3,
  C4 = 4,
  C5 = 5,
  C6 = 6,
  C1 = 7,
  C2 = 8,
  C3 = 9,
  C0 = 10,
  VIRGULE = 0;

function tell(text, score = false, click = false) {
  if (!score) {
    console.clear();
    if (click) {
      console.log("au clic sur le(s) bouton(s) associé(s), " + text);
    } else {
      console.log(text);
    }
  }
}

HTMLElement.prototype.prependHtml = function (element) {
  const div = document.createElement('div');
  div.innerHTML = element;
  div.classList.add('top');
  this.insertBefore(div, this.firstChild);
};

var debug = false;
var fw = false;
var logEnable = true;

var originLog = console.log
console.log = function (something) {
  if (logEnable) {
    originLog(something);
  }
};

function get_note() {
  var note = 0;

  // note += $('.calc').innerHTML.length == 586 + $('#result').innerHTML.length ? 0 : -3;

  if (!debug) logEnable = false;


  note += test_afficher_resultat(1.5);
  if (debug) console.log(note);

  note += test_reset(1.5);
  if (debug) console.log(note);
  note += test_reset(0.5, true);
  if (debug) console.log(note);
  note += reset.toString().indexOf('afficher_resultat') != -1 ? 0.5 : 0;
  if (debug) console.log(note);

  note += test_get_operateur(2);
  if (debug) console.log(note);
  note += test_get_operateur(0.5, true);
  if (debug) console.log(note);

  note += test_get_chiffre(2.5);
  if (debug) console.log(note);
  note += test_get_chiffre(0.5, true);
  if (debug) console.log(note);
  note += get_chiffre.toString().indexOf('afficher_resultat') != -1 ? 0.5 : 0;
  if (debug) console.log(note);

  note += test_calculer(3);
  if( debug ) console.log(note);

  note += test_calculer_et_afficher(2);
  if (debug) console.log(note);
  note += test_calculer_et_afficher(0.5, true);
  if (debug) console.log(note);
  note += calculer_et_afficher.toString().indexOf('calculer', 10) != -1 ? 0.5 : 0;
  if (debug) console.log(note);
  note += calculer_et_afficher.toString().indexOf('reset') != -1 ? 0.5 : 0;
  if (debug) console.log(note);
  note += calculer_et_afficher.toString().indexOf('afficher_resultat') != -1 ? 0.5 : 0;
  if (debug) console.log(note);

  note += test_get_operateur2(0.5);
  if (debug) console.log(note);
  note += get_operateur.toString().indexOf('calculer_et_afficher') != -1 ? 0.5 : 0;
  if (debug) console.log(note);
  note += test_get_operateur3(0.5);
  if (debug) console.log(note);
  note += get_operateur.toString().indexOf('calculer_et_afficher') != -1 ? 0.5 : 0;
  if (debug) console.log(note);
  note += test_calculer_et_afficher2(0.5);
  if (debug) console.log(note);
  // renvoi 1 quand le TP n'est pas fini
  note += test_get_chiffre2(0.5);
  if (debug) console.log(note);

  if (note >= 20 && !fw) {
    fw = true;
    loop();
  }

  if (!debug) logEnable = true;

  return note;
}

function is_debug() {
  return localStorage.getItem('debug') !== 'undefined';
}

function set_debug() {
  localStorage.setItem('debug', $('#show_debug:checked'));
}

var checked = is_debug() ? 'checked' : '';
$('body').prependHtml(`
    <div class="inline" id="note">Note: ~ / 20</div>
    <div class="wrapper inline">
      <div id="note_color" class="note-background" style="width: 0%;"></div>
    </div><br><br>
    <button class="btn">
    <label>
      <input type="checkbox" id="show_debug" ${checked}>Afficher debug</label>
      </button><br><div id="debug"></div>
`);

var update_is_running = false;

function update_debug() {
  if (!update_is_running) {
    update_is_running = true;
    var note = get_note();
    var note_width = Math.min(100, note * 5);
    $('#note_color').style.width = note_width + '%';
    $('#note').innerHTML = 'Note: ' + note + ' / 20'

    var debug = `
        <br>
        <i>État des variables: (éditables)</i><br>
        <div class="inline" style="width: 110px;">
          operande_1 :<br>
          operateur :<br>
          operande_2 :<br>
        </div>
        <div class="inline">
          <input type="text" id="op1" oninput="operande_1 = this.value;" value="${operande_1}">
          <button onclick="operande_1 = ''; update_debug();" class="clean">x</button><br>
          <input type="text" id="op" oninput="operateur = this.value;" value="${operateur}">
          <button onclick="operateur = ''; update_debug();" class="clean">x</button><br>
          <input type="text" id="op2" oninput="operande_2 = this.value;" value="${operande_2}">
          <button onclick="operande_2 = ''; update_debug();" class="clean">x</button><br>
        </div><br><br>
        <i>Tests functions (ouvrez la console) :</i><br>
        <button class="btn" onclick="test_afficher_resultat()">
          afficher_resultat()
        </button><br>
        <button class="btn" onclick="test_reset()">
          reset()
        </button>
        <button class="btn" onclick="test_reset( false, true )">
          test click reset()
        </button><br>
        <button class="btn" onclick="test_get_operateur()">
          get_operateur()
        </button>
        <button class="btn" onclick="test_get_operateur( false, true )">
          test click get_operateur()
        </button><br>
        <button class="btn" onclick="test_get_chiffre()">
          get_chiffre()
        </button>
        <button class="btn" onclick="test_get_chiffre( false, true )">
          test click get_chiffre()
        </button><br>
        <button class="btn" onclick="console.clear();console.log('l‘appel à calculer avec les valeurs courantes à renvoyé');console.log(calculer())">
          calculer()
        </button>
        <button class="btn" onclick="test_calculer(false)">
          test_calculer()
        </button><br>
        <button class="btn" onclick="test_calculer_et_afficher()">
          calculer_et_afficher()
        </button>
        <button class="btn" onclick="test_calculer_et_afficher( false, true )">
          test click calculer_et_afficher()
        </button><br><br>
        <i>Réécriture des functions (ouvrez la console) :</i><br>
        <button class="btn" onclick="test_get_operateur2()">
          get_operateur2()
        </button>
        <button class="btn" onclick="test_get_operateur3()">
          get_operateur3()
        </button><br>
        <button class="btn" onclick="test_calculer_et_afficher2()">
          calculer_et_afficher2()
        </button>
        <button class="btn" onclick="test_get_chiffre2()">
          get_chiffre2()
        </button>
      `;
    set_debug();
    $('#debug').innerHTML = is_debug() ? debug : '';
    update_is_running = false;
  }
}

$('.numbers').on('click', update_debug);
$('#show_debug').on('click', update_debug);
window.onload = function () {
  update_debug();
};


///// 1
function test_afficher_resultat(score) {
  if (afficher_resultat.toString().trim() == 'function afficher_resultat(){}') {
    if (!score) {
      console.log('Il semble que la fonction n‘existe pas encore');
    }
    return 0;
  }
  function after() {
    operande_1 = toperande_1;
    operande_2 = toperande_2;
    operateur = toperateur;
    $('#result').innerHTML = tresult;
    update_debug();
  }

  var toperande_1 = operande_1;
  var toperande_2 = operande_2;
  var toperateur = operateur;
  var tresult = $('#result').innerHTML;

  afficher_resultat('55');
  if ($('#result').innerHTML == '55') {
    tell('votre fonction "afficher_resultat" à l‘air de fonctionner correctement', score);
    after();
    return score;
  } else {
    tell('votre fonction "afficher_resultat" ne fonctionne pas, elle doit modifier le contenu du calque #result', score);
    after();
    return 0;
  }
}

///// 2 & 3
function test_reset(score, click = false) {
  if (reset.toString().trim() == 'function reset(){}') {
    if (!score) {
      console.log('Il semble que la fonction n‘existe pas encore');
    }
    return 0;
  }
  function after() {
    operande_1 = toperande_1;
    operande_2 = toperande_2;
    operateur = toperateur;
    $('#result').innerHTML = tresult;
    update_debug();
  }

  var toperande_1 = operande_1;
  var toperande_2 = operande_2;
  var toperateur = operateur;
  var tresult = $('#result').innerHTML;

  operande_1 = "test";
  operande_2 = "test";
  operateur = "test";
  $('#result').innerHTML = "test";
  if (click) {
    $('#reset').click();
  } else {
    reset();
  }
  if (operande_1 == "" && operande_2 == "" && operateur == "" && $('#result').innerHTML == "0") {
    tell("votre fonction reset() réinitialise correctement les variables", score, click);
    after();
    return score;
  } else {
    tell(`votre fonction reset() ne marche pas correctement, voilà l‘état des variables dans le test :
\noperande_1 = "${operande_1}"   // attendu = "" (chaine vide)
\noperande_2 = "${operande_2}"   // attendu = "" (chaine vide)
\noperateur = "${operateur}"   // attendu = "" (chaine vide)
\nle contenu de #result = "`+ $('#result').innerHTML + `"   // attendu = "0"
\n`, score, click);
    after()
    return 0;
  }
}

///// 4 & 5
function test_get_operateur(score, click = false) {
  if (get_operateur.toString().trim() == 'function get_operateur(){}') {
    if (!score) {
      console.log('Il semble que la fonction n‘existe pas encore');
    }
    return 0;
  }
  function after() {
    operande_1 = toperande_1;
    operande_2 = toperande_2;
    operateur = toperateur;
    $('#result').innerHTML = tresult;
    update_debug();
  }

  var toperande_1 = operande_1;
  var toperande_2 = operande_2;
  var toperateur = operateur;
  var tresult = $('#result').innerHTML;

  var fois, divi, plus, minus;

  operande_1 = '55';

  if (click) {
    $('.operateur')[MULTI].click();
    fois = operateur;
    $('.operateur')[DIVI].click();
    divi = operateur;
    $('.operateur')[ADD].click();
    plus = operateur;
    $('.operateur')[SOUS].click();
    minus = operateur;
  } else {
    get_operateur.apply($('.operateur')[MULTI]);
    fois = operateur;
    get_operateur.apply($('.operateur')[DIVI]);
    divi = operateur;
    get_operateur.apply($('.operateur')[ADD]);
    plus = operateur;
    get_operateur.apply($('.operateur')[SOUS]);
    minus = operateur;
  }

  if (fois == "*" && divi == "/" && plus == "+" && minus == "-") {
    tell("votre fonction get_operateur() remplie correctement la variable operateur", score, click);
    after();
    return score;
  } else {
    tell(`votre fonction get_operateur() ne marche pas correctement, voilà l‘état des opérateur si je clic sur * puis / puis + puis - :
\n* = "${fois}"
\n/ = "${divi}"
\n+ = "${plus}"
\n- = "${minus}
\n"`, score, click);
    after()
    return 0;
  }
}

///// 6 & 7
function test_get_chiffre(score, click = false) {
  if (get_chiffre.toString().trim() == 'function get_chiffre(){}') {
    if (!score) {
      console.log('Il semble que la fonction n‘existe pas encore');
    }
    return 0;
  }
  function after() {
    operande_1 = toperande_1;
    operande_2 = toperande_2;
    operateur = toperateur;
    $('#result').innerHTML = tresult;
    update_debug();
  }

  var toperande_1 = operande_1;
  var toperande_2 = operande_2;
  var toperateur = operateur;
  var tresult = $('#result').innerHTML;

  operande_1 = "12";
  operande_2 = "";
  operateur = "";

  var res1, res2, res3, res4, res5, res6, res7, res8, print1, print2, print3, print4;

  if (click) {
    $('.chiffre')[C0].click();
    res1 = operande_1;
    res2 = operande_2;
    print1 = $('#result').innerHTML;
    $('.chiffre')[C5].click();
    res3 = operande_1;
    res4 = operande_2;
    print2 = $('#result').innerHTML;
    operateur = "+";
    $('.chiffre')[C3].click();
    res5 = operande_1;
    res6 = operande_2;
    print3 = $('#result').innerHTML;
    $('.chiffre')[C4].click();
    res7 = operande_1;
    res8 = operande_2;
    print4 = $('#result').innerHTML;
  } else {
    get_chiffre.apply($('.chiffre')[C0]);
    res1 = operande_1;
    res2 = operande_2;
    print1 = $('#result').innerHTML;
    get_chiffre.apply($('.chiffre')[C5]);
    res3 = operande_1;
    res4 = operande_2;
    print2 = $('#result').innerHTML;
    operateur = "+";
    get_chiffre.apply($('.chiffre')[C3]);
    res5 = operande_1;
    res6 = operande_2;
    print3 = $('#result').innerHTML;
    get_chiffre.apply($('.chiffre')[C4]);
    res7 = operande_1;
    res8 = operande_2;
    print4 = $('#result').innerHTML;
  }

  if (res1 == "120" && res2 == "" && print1 == "120" &&
    res3 == "1205" && res4 == "" && print2 == "1205" &&
    res5 == "1205" && res6 == "3" && print3 == "3" &&
    res7 == "1205" && res8 == "34" && print4 == "34") {
    tell("votre fonction get_chiffre() remplie correctement les variables operande_1 et operande_2", score, click);
    after();
    return score;
  } else {
    tell(`votre fonction get_chiffre() ne marche pas correctement, voilà l‘état des variables pendant un scénario :
au début operande_1 = 12 \n
\non appuis sur 0 :
\noperande1: "${res1}"    // attendu = "120"
\noperande2: "${res2}"    // attendu = ""
\naffichage: "${print1}"  // attendu = "120"
\non appuis sur 5 :
\noperande1: "${res3}"    // attendu = "1205"
\noperande2: "${res4}"    // attendu = ""
\naffichage: "${print2}"  // attendu = "1205"
\non appuis sur + :
\non appuis sur 3 :
\noperande1: "${res5}"    // attendu = "1205"
\noperande2: "${res6}"    // attendu = "3"
\naffichage: "${print3}"  // attendu = "3"
\non appuis sur 4 :
\noperande1: "${res7}"    // attendu = "1205"
\noperande2: "${res8}"    // attendu = "34"
\naffichage: "${print4}"  // attendu = "34"
      `, score, click);
    after();
    return 0;
  }
}

///// 8
function test_calculer(score) {
  if (calculer.toString().trim() == 'function calculer(){}') {
    if (!score) {
      console.log('Il semble que la fonction n‘existe pas encore');
    }
    return 0;
  }
  function after() {
    operande_1 = toperande_1;
    operande_2 = toperande_2;
    operateur = toperateur;
    $('#result').innerHTML = tresult;
    update_debug();
  }

  var toperande_1 = operande_1;
  var toperande_2 = operande_2;
  var toperateur = operateur;
  var tresult = $('#result').innerHTML;

  var res1, res2, res3, res4, res5,
    tmp1, tmp2, tmp3, tmp4, tmp5;

  operande_1 = '1'; operateur = '-'; operande_2 = '3';
  tmp1 = operande_1 + ' ' + operateur + ' ' + operande_2;
  res1 = calculer();
  operande_1 = '2'; operateur = '*'; operande_2 = '6.6';
  tmp2 = operande_1 + ' ' + operateur + ' ' + operande_2;
  res2 = calculer();
  operande_1 = '3'; operateur = '+'; operande_2 = '6';
  tmp3 = operande_1 + ' ' + operateur + ' ' + operande_2;
  res3 = calculer();
  operande_1 = '10'; operateur = '/'; operande_2 = '4';
  tmp4 = operande_1 + ' ' + operateur + ' ' + operande_2;
  res4 = calculer();
  operande_1 = '11'; operateur = '+'; operande_2 = '11';
  tmp5 = operande_1 + ' ' + operateur + ' ' + operande_2;
  res5 = calculer();

  if (res1 == -2 && res2 == 13.2 && res3 == 9 && res4 == 2.5 && res5 == 22) {
    tell("votre fonction calculer() renvois le bon résultat", score);
    after();
    return score;
  } else {
    tell(`votre fonction calculer() ne marche pas correctement, voilà les résultats optenus :
${tmp1} = ${res1}\n
${tmp2} = ${res2}\n
${tmp3} = ${res3}\n
${tmp4} = ${res4}\n
${tmp5} = ${res5}\n
    `, score);
    after()
    return 0;
  }
}


///// 9 & 10
function test_calculer_et_afficher(score, click = false) {
  if (calculer_et_afficher.toString().trim() == 'function calculer_et_afficher(){}') {
    if (!score) {
      console.log('Il semble que la fonction n‘existe pas encore');
    }
    return 0;
  }
  function after() {
    operande_1 = toperande_1;
    operande_2 = toperande_2;
    operateur = toperateur;
    $('#result').innerHTML = tresult;
    update_debug();
  }

  var toperande_1 = operande_1;
  var toperande_2 = operande_2;
  var toperateur = operateur;
  var tresult = $('#result').innerHTML;

  operande_1 = '1'; operateur = '+'; operande_2 = '3';
  var tmp1 = 'operande_1 = "' + operande_1 + '" ; operateur = "' + operateur + '" ; operande_2 = "' + operande_2 + '" ;';

  if (click) {
    $('#calculer').click();
  } else {
    calculer_et_afficher();
  }

  if (operande_1 == 4 && operateur == '' && operande_2 == '' && $('#result').innerHTML == '4') {
    tell("votre fonction calculer_et_afficher() semble bien remplir toutes les étapes de son rôle", score, click);
    after();
    return score;
  } else {
    tell(`votre fonction calculer_et_afficher() ne marche pas correctement, voilà l‘état des variables pendant un scénario :
\n on pose: ${tmp1}
\n on execute calculer_et_afficher() et on obtient :
\n operande_1 = "${operande_1}"     // attendu = "4"
\n operande_1 = "${operateur}"     // attendu = ""
\n operande_2 = "${operande_2}"     // attendu = ""
\n #result HTML = "${$('#result').innerHTML}"     // attendu = "4"

      `, score, click);
    after();
    return 0;
  }
}

///// 11
function test_get_operateur2(score) {
  if (get_operateur.toString().trim() == 'function get_operateur(){}') {
    if (!score) {
      console.log('Il semble que la fonction n‘existe pas encore');
    }
    return 0;
  }
  function after() {
    operande_1 = toperande_1;
    operande_2 = toperande_2;
    operateur = toperateur;
    $('#result').innerHTML = tresult;
    update_debug();
  }

  var toperande_1 = operande_1;
  var toperande_2 = operande_2;
  var toperateur = operateur;
  var tresult = $('#result').innerHTML;

  operande_1 = '5'; operateur = '*'; operande_2 = '3';
  var tmp1 = 'operande_1 = "' + operande_1 + '" ; operateur = "' + operateur + '" ; operande_2 = "' + operande_2 + '" ;';

  get_operateur.apply($('.operateur')[ADD]);

  if (operande_1 == 15 && operateur == '+' && operande_2 == '' && $('#result').innerHTML == '15') {
    tell("votre fonction get_operateur() version 2 semble fonctionner et calculer au clic sur un opérateur", score);
    after();
    return score;
  } else {
    tell(`votre fonction get_operateur() version 2 ne marche pas correctement, voilà l‘état des variables pendant un scénario :
\n on pose: ${tmp1}
\n on appuis sur "+" et on obtient :
\n operande_1 = "${operande_1}"     // attendu = "15"
\n operateur = "${operateur}"     // attendu = "+"
\n operande_2 = "${operande_2}"     // attendu = ""
\n #result HTML = "${$('#result').innerHTML}"     // attendu = "15"

      `, score);
    after();
    return 0;
  }
}

///// 11
function test_get_operateur3(score) {
  if (get_operateur.toString().trim() == 'function get_operateur(){}') {
    if (!score) {
      console.log('Il semble que la fonction n‘existe pas encore');
    }
    return 0;
  }
  function after() {
    operande_1 = toperande_1;
    operande_2 = toperande_2;
    operateur = toperateur;
    $('#result').innerHTML = tresult;
    update_debug();
  }

  var toperande_1 = operande_1;
  var toperande_2 = operande_2;
  var toperateur = operateur;
  var tresult = $('#result').innerHTML;

  operande_1 = ''; operateur = ''; operande_2 = '';
  var tmp1 = 'operande_1 = "' + operande_1 + '" ; operateur = "' + operateur + '" ; operande_2 = "' + operande_2 + '" ;';

  get_operateur.apply($('.operateur')[ADD]);

  if (operande_1 == '' && operateur == '' && operande_2 == '') {
    tell("votre fonction get_operateur() version 3 semble fonctionner et calculer au clic sur un opérateur", score);
    after();
    return score;
  } else {
    tell(`Erreur: votre fonction get_operateur() version 3 ne marche pas correctement, voilà l‘état des variables pendant un scénario :
\n on pose: ${tmp1}
\n on appuis sur "+" et on obtient :
\n operande_1 = "${operande_1}"     // attendu = ""
\n operateur = "${operateur}"     // attendu = ""
\n operande_2 = "${operande_2}"     // attendu = ""

      `, score);
    after();
    return 0;
  }
}


///// 12
function test_calculer_et_afficher2(score) {
  if (calculer_et_afficher.toString().trim() == 'function calculer_et_afficher(){}') {
    if (!score) {
      console.log('Il semble que la fonction n‘existe pas encore');
    }
    return 0;
  }
  function after() {
    operande_1 = toperande_1;
    operande_2 = toperande_2;
    operateur = toperateur;
    $('#result').innerHTML = tresult;
    update_debug();
  }

  var toperande_1 = operande_1;
  var toperande_2 = operande_2;
  var toperateur = operateur;
  var tresult = $('#result').innerHTML;

  var tmp1, tmp2, tmp3;

  try {
    operande_1 = ''; operateur = '+'; operande_2 = '3';
    tmp1 = calculer_et_afficher();
    operande_1 = '5'; operateur = ''; operande_2 = '3';
    tmp2 = calculer_et_afficher();
    operande_1 = '5'; operateur = '+'; operande_2 = '';
    tmp3 = calculer_et_afficher();

    if (tmp1 === false && tmp2 === false && tmp3 === false) {
      tell("votre fonction calculer_et_afficher() version 2 semble fonctionner et calculer au clic sur un opérateur", score);
      after();
      return score;
    } else {
      tell(`Erreur: votre fonction calculer_et_afficher() version 2 ne marche pas correctement, lorsqu'il manque une opérande ou l'opérateur, le calcul est quand même lancé`, score);
      after();
      return 0;
    }
  } catch (e) {
    tell(`Erreur: votre fonction calculer_et_afficher() version 2 ne marche pas correctement, lorsqu'il manque une opérande ou l'opérateur, le calcul est quand même lancé`, score);
    after();
    return 0;
  }
}


///// 12
function test_get_chiffre2(score) {
  if (get_chiffre.toString().trim() == 'function get_chiffre(){}') {
    if (!score) {
      console.log('Il semble que la fonction n‘existe pas encore');
    }
    return 0;
  }
  function after() {
    operande_1 = toperande_1;
    operande_2 = toperande_2;
    operateur = toperateur;
    $('#result').innerHTML = tresult;
    update_debug();
  }

  var toperande_1 = operande_1;
  var toperande_2 = operande_2;
  var toperateur = operateur;
  var tresult = $('#result').innerHTML;

  var tmp1, tmp2, tmp3;

  operande_1 = '55.45'; operateur = ''; operande_2 = '';
  get_chiffre.apply($('.chiffre')[VIRGULE]);
  get_chiffre.apply($('.chiffre')[VIRGULE]);
  get_chiffre.apply($('.chiffre')[VIRGULE]);


  if (operande_1 === '55.45') {
    tell("votre fonction get_chiffre() version 2 semble fonctionner et ne pas ajouter deux virgules", score);
    after();
    return score;
  } else {
    tell(`Erreur: votre fonction get_chiffre() ajoute des virgules même si elle existe déjà`, score);
    after();
    return 0;
  }
}