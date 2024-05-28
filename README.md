# HTTP Header Parser

A collection of parsers to provide parsing capabilities for a variety of HTTP Header formats.

## Accept

The Accept content-negotiation format described by [RFC2068](https://www.rfc-editor.org/rfc/rfc2068).

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
