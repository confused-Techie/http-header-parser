# Values

This document specifies the types of values that may be present within this code.

## Tokenizer

The spec tokenizer produces many tokens, each token will only contain a single character.

* `DOUBLE_QUOTES`: `"`
* `BAR`: `|`
* `OPEN_PAREN`: `(`
* `CLOSE_PAREN`: `)`
* `ASTERISK`: `*`
* `OPEN_BRACKET`: `[`
* `CLOSE_BRACKET`: `]`
* `EQUAL_SIGN`: `=`
* `POUND`: `#`
* `SEMI_COLON`: `;`
* `CARRIAGE_RETURN`: `\r`
* `NEWLINE`: `\n`
* `TAB`: `\t`
* `SPACE`: `\s` Technically a catchall for any other type of whitespace.
* `DIGIT`: `\d`
* `TEXT`: A catchall for all other types of characters.
* `EOF`: End of file.

## Parser

The specification parser produces the following nodes, with some having special properties:

### Syntax Structures & Control
* `ABNF`: Start of file (Augmented BNF)
* `LITERAL`: Syntax Structure = `"literal"`
* `ALTERNATIVE`: Syntax Structure = `rule1 | rule2`
* `COMMENT`: Syntax Structure = `; blah blah\n`
* `REPITITION`: Syntax Structure = `<n>*<m>rule`
  - min
  - max
* `SPECIFIC-REPETITION`: Syntax Structure = `<n>rule`
  - count
* `LIST`: Syntax Structure = `<n>#<m>rule`
  - min
  - max
* `OPTIONAL`: Syntax Structure = `[rule]` (Identical to 'REPETITION')
  - min
  - max
* `LOCAL-ALTERNATIVE`: Syntax Structure = `(rule1 rule2)`
* `SPACE`: Whitespace between items.
* `NAMED-RULE`: Text naming a specific rule, that likely is defined in `ast.definitions[NAMED-RULE]`

### Data Types

This spec aims to have as few datatypes as possible. In general if a datatype can be expanded further into ABNF it is. Where it should then be treated just like any other `NAMED-RULE`.

This document will only list those datatypes that could not be further expanded.

* `OCTET`
* `CHAR`
* `UPALPHA`
* `LOALPHA`
* `DIGIT`
* `CTL`
* `CR`
* `LF`
* `SP`
* `HT`
* `DOUBLE-QUOTE-MARK`
* `TEXT`: While this may be possible to expand, it proves rather difficult to do so.
