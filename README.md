# HTTP Header Parser

A collection of parsers to provide parsing capabilities for a variety of HTTP Header formats.

## Accept

The Accept content-negotiation format described by [RFC2068](https://www.rfc-editor.org/rfc/rfc2068#section-14.1).

Example: `audio/*; q=0.2, audio/basic`

Format:

```
Accept         = "Accept" ":"
                 #( media-range [ accept-params ] )

media-range    = ( "*/*"
                 | ( type "/" "*" )
                 | ( type "/" subtype )
                 ) *( ";" parameter )

accept-params  = ";" "q" "=" qvalue *( accept-extension )

accept-extension = ";" token [ "=" ( token | quoted-string ) ]
```

Usage:

```js
const parser = require("http-header-parser");

const str = "audio/*; q=0.2, audio/basic";

const parsed = parser.accept(str);
```

## Accept Charset

The Accept Charset content-negotiation format described by [RFC2068](https://www.rfc-editor.org/rfc/rfc2068#section-14.2).

Example: `iso-8859-5, unicode-1-1;q=0.8`

Format:

```
Accept-Charset = "Accept-Charset" ":"
          1#( charset [ ";" "q" "=" qvalue ] )
```

Usage:

```js
const parser = require("http-header-parser");

const str = "iso-8859-5, unicode-1-1;q=0.8";

const parsed = parser.acceptCharset(str);
```
