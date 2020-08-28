"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Json2interface = void 0;

var _json2interface = require("../lib/json2interface");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Json2interface = /*#__PURE__*/function () {
  function Json2interface() {
    _classCallCheck(this, Json2interface);
  }

  _createClass(Json2interface, [{
    key: "hello",
    value: function hello() {
      console.log('hello');
    }
  }]);

  return Json2interface;
}();

exports.Json2interface = Json2interface;