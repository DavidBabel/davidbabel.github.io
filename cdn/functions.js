// adress : https://davidbabel.github.io/cdn/functions.js

function addToBody(content, id, input = "div") {
  const div = document.createElement(input);
  if (id) {
    div.id = id;
  }
  div.innerHTML = content;
  document.body.appendChild(div);
}

function addStyle(content, id) {
  addToBody(content, id, "style");
}

function addResult(content) {
  addStyle(`
    #result {
      position: fixed;
      bottom: 4px;
    }

    .img-resize {
      width: 100%;
      max-width: 550px;
    }
  `);
  addToBody(content, "result");
}

function $(elem) {
  var res = document.querySelectorAll(elem);
  return res.length > 1 ? res : res[0];
}

Object.prototype.on = function (e, cb) {
  if (Array.from(this).length > 0) {
    Array.from(this).forEach(function (elem) {
      elem.addEventListener(e, cb);
    });
  } else {
    this.addEventListener(e, cb);
  }
};
