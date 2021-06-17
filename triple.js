"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function sparqlEscapeString(value) {
  return '"""' + value.replace(/[\\"]/g, function (match) {
    return '\\' + match;
  }) + '"""';
}

;

function sparqlEscapeUri(value) {
  return '<' + value.replace(/[\\"']/g, function (match) {
    return '\\' + match;
  }) + '>';
}

;

var Triple = /*#__PURE__*/function () {
  function Triple(_ref) {
    var subject = _ref.subject,
        predicate = _ref.predicate,
        object = _ref.object,
        datatype = _ref.datatype,
        _ref$language = _ref.language,
        language = _ref$language === void 0 ? null : _ref$language;

    _classCallCheck(this, Triple);

    _defineProperty(this, "subject", void 0);

    _defineProperty(this, "predicate", void 0);

    _defineProperty(this, "object", void 0);

    _defineProperty(this, "datatype", void 0);

    this.subject = subject;
    this.predicate = predicate;
    this.object = object;
    this.datatype = datatype;
    this.language = language;
  }

  _createClass(Triple, [{
    key: "isEqual",
    value: function isEqual(other) {
      return this.subject === other.subject && this.predicate === other.predicate && this.object === other.object && this.datatype === other.datatype && this.language === this.language;
    }
  }, {
    key: "toNT",
    value: function toNT() {
      var predicate = this.predicate === 'a' ? this.predicate : sparqlEscapeUri(this.predicate);
      var obj;

      if (this.datatype === 'http://www.w3.org/2000/01/rdf-schema#Resource') {
        obj = sparqlEscapeUri(this.object);
      } else if (this.language) {
        obj = "".concat(sparqlEscapeString(this.object), "@").concat(this.language);
      } else if (this.datatype) {
        obj = "".concat(sparqlEscapeString(this.object), "^^").concat(sparqlEscapeUri(this.datatype));
      } else {
        obj = sparqlEscapeString(this.object);
      }

      return "".concat(sparqlEscapeUri(this.subject), " ").concat(predicate, " ").concat(obj, " .");
    }
  }]);

  return Triple;
}();

exports["default"] = Triple;
module.exports = exports.default;