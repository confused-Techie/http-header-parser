import { _ } from "../shared/oneSpace.js"
import { commaDelimiter } from "../shared/commaDelimiter.js"

start
 = mediaRange|.., commaDelimiter| commaDelimiter?

mediaRange
 = type:[a-zA-Z*]+ "/" subtype:[a-zA-Z*]+ _ params:params*
 {
   return { type: type.join(""), subtype: subtype.join(""), params: params };
 }

params
 = ";" _ key:[a-zA-Z]+ _ "=" _ value:[a-zA-Z0-9.]+
 {
   return { key: key.join(""), value: value.join("") };
 }
