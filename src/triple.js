import RdfFactory from '@rdfjs/data-model';

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
  language;

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
      && this.language === other.language;
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

  /**
   * returns a rdfjs compliant quad
   */
  toQuad() {
    let object;
    if (this.datatype === 'http://www.w3.org/2000/01/rdf-schema#Resource') {
      object = RdfFactory.namedNode(this.object);
    }
    else if (this.language) {
      // language takes precedence over datatype
      object = RdfFactory.literal(this.object, this.language);
    }
    else {
      object = RdfFactory.literal(this.object, RdfFactory.namedNode(this.datatype));
    }
    return RdfFactory.quad(
      RdfFactory.namedNode(this.subject),
      RdfFactory.namedNode(this.predicate),
      object
    );
  }
}
