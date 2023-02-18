# ProtoXT - A new way to extend Object prototypes

A small library to allow you to safely add 'dynamic properties' to (the prototype of) objects, 
with the help of Symbols.

This may be useful for 'monkey patching' native JavaScript types to give them new capabilities.

***Note***: this library is a fork of the [metho project](https://github.com/jonrandy/metho) from Jon Randy.

## How to use

The script can be imported from https://kooiinc.github.io/ProtoXT/protoxt.js

ProtoXT is fairly simple. It offers either one function (default) or two basic functions.
The default or first function (`add`) adds 'dynamic properties' to target object(s) 
(as a symbol). The non default `addMethod ` createts an object with an enclosed function 
and  properties that can later be added to Objects using a `To`-method. 

The `add`/default function will return a `Symbol`.

The `addMethod` function returns an Object containing the `To` method to add an enclosed function 
to one or more Objects (prototypes) later. The `To` method returns a `Symbol` too.  

The resulting `Symbol`s are the property 'names'.

## Using the default
Import the library: 

`import addMethod from [location of protox.js]`.

Now `addMethod is available`
`addMethod(targetOrTargets, function, [{outerSyntax: [true/false], symbolName: [a name]}])`

When the default is used (let's call it `addMethod`) it is the only function you'll need.

It will use `addWithParams` or `addSimple` based on the arity (the number of parameters)
of the passed function. An arity of 0 will cause `addSimple` to be used <sup><b>*</b>)</sup>.
Anything else will cause `addWithParams` (`outerSyntax: false`) or `addProperty` (`outerSyntax: true`) 
to be used.

## Using addExtensionFn
Import the library:

`import {add, addExtensionFn: addMethod} from [location of protox.js]`.

Now the methods `add`  and `addMethod` are available. The `add`-method is the same as the default.

`addMethod(function, [{outerSyntax: [true/false], symbolName: [a name]}])`

This delivers an Object with one method: `To` which enables you to add the enclosed function as
(symbolic) extension to one ore more Objects (prototypes). For example:

```js 
  const logger = addMethod(function() { console.log(this, this.contructor); })
  // [... code cntd]
  const logCtor = logger.To(Array, RegExp, String);
  /[a-z]/g[logCtor] // => /[a-z]/g, f RegeXp() [...]
  `hello`[logCtor]  // => `hello`, f String() [...]
```

When added with option `outerSyntax` set to `true` the syntax for your property will be 
that of a more regular function call:
```js
// options.outerSyntax = true
object[property](x)
```
Otherwise you use
```js
// options.outerSyntax = false
object[property(x)]
```
There is a slight performance hit when not using `outerSyntax` - hence the reason for the switch. 
To specify more than one target for the function, you should pass an array of targets.

## Some examples:

```js
  import addMethod from 'protoxt';
  
  // number to hexadecimal
  const asHex = addMethod(
    Number,
    function () {
      return this.toString(16);
    }
  );
  console.log(65534[asHex]);  // fffe
  
  // string to uppercase
  const upper = addMethod(
    String,
    function () {
      return this.toUpperCase();
    }
  );
  
  // Note the default [length] value here
  const chunk = addMethod(
    String,
    function (length = 2) {
      return this.match(new RegExp('.{1,' + length + '}', 'g'))
    }
  );
  
  console.log("Hello World!"[upper][chunk(2)]);  // ['HE', 'LL', 'O ', 'WO', 'RL', 'D!']
  
  const dateFormatter = () => {
    const dateOnlyOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      timeZone: 'Europe/Amsterdam', };
    return addMethod(Date, function() { 
      return new Intl.DateTimeFormat(`nl-NL`, dateOnlyOptions).format(this); 
    });
  };
  
  const format = dateFormatter();
  
  console.log(new Date(`2029/03/02`)[format]); // 2 maart 2029
```

[**See also**](https://stackblitz.com/edit/web-platform-atdytt?file=script.js)

<sup><b>*)</b></sup> With default parameter values or spreaded arguments the arity
  of a function may be 0. So this fork checks length, *and* uses a (ProtoXT Function extension) `length` method
  (`hasArgs`) to check if any such parameters with default parameters exist.
