
start
 = mediaRange|.., mediaRangeDelimiter| mediaRangeDelimiter?

mediaRange
 = type:[a-zA-Z*]+ "/" subtype:[a-zA-Z*]+ _ params:params*
 {
   return { type: type.join(""), subtype: subtype.join(""), params: params }
 }

params
 = ";" _ key:[a-zA-Z]+ _ "=" _ value:[a-zA-Z0-9.]+
 {
   return { key: key.join(""), value: value.join("") };
 }

mediaRangeDelimiter
 = _ "," _

_ = oneSpace*

oneSpace
 = whitespace / lineTerminator

whitespace "whitespace"
 = [\t\v\f ]

lineTerminator "end of line"
 = [\n\r]
