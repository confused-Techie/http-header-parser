import { _ } from "../shared/oneSpace.js"
import { commaDelimiter } from "../shared/commaDelimiter.js"

start
 = charsetRange|.., commaDelimiter| commaDelimiter?

charsetRange
 = charset:[a-zA-Z0-9-]+ _ params:params*
 {
   return { charset: charset.join(""), params: params };
 }

params
 = ";" _ key:[a-zA-Z]+ _ "=" _ value:[a-zA-Z0-9.]+
 {
   return { key: key.join(""), value: value.join("") };
 }
