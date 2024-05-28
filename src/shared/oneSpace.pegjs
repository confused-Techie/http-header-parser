_ = oneSpace*

oneSpace
 = whitespace / lineTerminator

whitespace "whitespace"
 = [\t\v\f ]

lineTerminator "end of line"
 = [\n\r]
 
