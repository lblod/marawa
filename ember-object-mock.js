function get( object, key ){
  return object[key];
}

function set( object, key, value ){
  object[key] = value;
}

function warn( string ) {
  console.log( string );
};


exports = { get, set, warn };
