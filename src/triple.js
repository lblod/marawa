function sparqlEscapeString( value ){
  return '"""' + value.replace(/[\\"]/g, function(match) { return '\\' + match; }) + '"""';
};

function sparqlEscapeUri( value ){
  return '<' + value.replace(/[\\"']/g, function(match) { return '\\' + match; }) + '>';
};

export default class Triple {
  subject;
  predicate;
  object;
  datatype;

  constructor({ subject, predicate, object, datatype, language = null}) {
    this.subject = subject;
    this.predicate = predicate;
    this.object = object;
    this.datatype = datatype;
    this.language = language;
  }

  isEqual(other) {
    return this.subject === other.subject
      && this.predicate === other.predicate
      && this.object === other.object
      && this.datatype === other.datatype
      && this.language === this.language;
  }

  toNT() {
    const predicate = this.predicate === 'a' ? this.predicate : sparqlEscapeUri(this.predicate);
    let obj;
    if (this.datatype === 'http://www.w3.org/2000/01/rdf-schema#Resource') {
      obj = sparqlEscapeUri(this.object);
    }
    else if (this.language) {
      obj = `${sparqlEscapeString(this.object)}@${this.language}`;
    }
    else if (this.datatype) {
      obj = `${sparqlEscapeString(this.object)}^^${sparqlEscapeUri(this.datatype)}`;
    }
    else {
      obj = sparqlEscapeString(this.object);
    }
    return `${sparqlEscapeUri(this.subject)} ${predicate} ${obj} .`;
  }
}
