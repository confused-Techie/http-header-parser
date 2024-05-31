# Notes

So now that we have the basics of tokenizing and parsing we have a big question.

How do we handle auto-expansion and the depth of fields?

Such as encountering the token text 'CRLF'.

This is defined as:

```
CRLF  = CR LF
```

## Option 1

We could define a node of CRLF, then make the validator aware of this node and handle it there.
This means there's zero duplication, but an increasingly complex validator.
But this also means if the definition changes throughout the lifecycle of RFCs it's easier to change.

## Option 2

We auto-expand the node, so instead of adding a 'CRLF' node, we add a node with the children of 'CR' and 'LF'.
Doing this down to the basic datatypes for more complex tokens.

This could result in some serious duplication, and means that adding more complex nodes is increasingly complex.
But makes the validator much simpler since it only ever has to walk down the ast.
And the validator only ever needs to know about the simplest datatypes.

## Option 3

For each node like this we add the definition to the top level ast.
We have to do this anyway when parsing complex syntaxs that include multiple definitions, so the validator will already have to be aware of this.

This also means there is zero duplication, and the ast will only ever have as many definitions as needed.

But also then means that the validator only has to know about the most basic datatypes, and nothing more.

=============

But this also means that we need to figure out the logicstics of adding this data.
Since we can't just add the string data, we would have to add the AST of each type of node which may be difficult mid parse.

But maybe it could be simple by only ever adding the simplest form of nodes onto it?

Such as:

```
Encounter: CRLF

Add top level definition like:

{
  type: definition,
  name: crlf,
  children: [
    {
      type: cr
    },
    {
      type: lf
    }
  ]
}

Then we add the top level definitions of these:

{
  type: definition,
  name: cr
}

{
  type: definition,
  name: lf
}

In this example, CR and LF are basic data types and wouldn't need to actually be added
as it's own definition, but that's the idea.
```

This would mean we need to keep a record of all definitions, or have a simple way to check
for all possible definitions to avoid duplication. But that may be the way to go.

Especially since each individual value isn't that complex, it's only going down the tree that it becomes so.

### Option 3.1

So this follows the same as above, but instead of manually adding the nodes as top level definitions
we instead manager tokenizing and parsing the ABNF syntax definition of this node. Adding that instead.

This would be a recursive process and can become rather consuming of resources, but especially since we only build our AST once, might not be that bad.

---

# Notes about package as a whole.

Looking into this, it's slightly disheartening to find out the major differences in RFCs.
Such as RFC822 having totally different valid datatypes and definitions. And I'm assuming everything else will too.

So that means what I'm building now will only ever be valid for RFC 2068 HTTP/1.1 spec.

But there is a way.

The spec tokenizer should be valid for nearly everything, although it may be possible different specs have slightly different syntax structures, but in general the syntax seems to remain the same.

And the framework of the parser while small, is complex and fullfilling, with the datatypes and `parse()` method only seeming to need change between versions.

Then of course if the AST is flexible enough, the validator will be able to work no matter what.

What this could mean is this package is published as JavaScript's ABNF. Standalone it only exports the following:
  * spec tokenizer
  * parser: Minus all datatypes
  * input tokenizer
  * validator

Then within the organization I could publish a slew of packages for every single spec I want to.

Such as publishing 'RFC2068'

This package then has ABNF as a dependency, and we use the spec and input tokenizer as is, since that's unlikely to need change.

Then we extend the parser to include the datatypes for each spec.
As well as extend the validator for each spec.
That means each individual package will probably be rather small, and can then include an AST for their use case only.

That does increase the possibility of breakage due to any changes in the core system, but would be really cool.
