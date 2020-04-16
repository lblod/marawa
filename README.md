# Marawa
npm module extracted from https://github.com/lblod/notulen-importer-service/commit/87b3014941fe33edc5d8d2b94f0429f0868c2495

## Development

Developing with marawa implies three steps :
- linking marawa to the application that uses it (/!\ marawa might be used at several places in the same project (like frontend + a plugin used by the frontend), double check it is linked at all the relevant places)
- preparing the package
```
npm run-scripts prepare
```
- restarting the frontend