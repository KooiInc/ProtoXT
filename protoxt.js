// one size fits all
export { add as default, add as addExtension, addExtensionFn };
const getValidatedTargets = targets => ({
  targets: [].concat(targets).map(obj => obj && obj.prototype),
  get invalid() { return this.targets.find(v => v === null || v === undefined || v.prototype && Object.getPrototypeOf(v.prototype || 0).constructor !== Object); }, });
const isArrow = f => !`${f}`.trim().startsWith(`function`);
const length = addSimple( [Function.prototype], hasArgs);
const noCando = (targets, fn) => {
  const error = targets.invalid || targets.invalid === null
    ? `ProtoXT: (one of) the target(s) is not valid.` :
    !(fn instanceof Function) ? `ProtoXT: [fn] *must* be a Function instance.` : false;
  error && console.error(error);
  return !!error; };

function addExtensionFn( fn, props ) {
  return { To: (...targetOrTargets) => add(targetOrTargets, fn, props) };
}


function add(targetOrTargets, fn, { outerSyntax = false, symbolName = fn?.name, asProperty = false } = {} ) {
  const targetsChecked = getValidatedTargets([targetOrTargets].flat());

  return noCando(targetsChecked, fn)
    ? false
    : fn[length]
      ? outerSyntax || asProperty ? addProperty(targetsChecked.targets, fn, { symbolName, asProperty } )
        : addWithParams(targetsChecked.targets, fn, { symbolName })
      : addSimple(targetsChecked.targets, fn, { symbolName });
}

function addProperty(targetOrTargets, f, { symbolName = f?.name, asProperty = false } = {}) {
  const s = Symbol(symbolName);
  targetOrTargets.forEach( target => {
    if (asProperty) {
      Object.defineProperty( target, s, {
        configurable: true,
        get: isArrow(f) ? function(...args) { return f(this, ...args); } : f
      });
      return;
    }
    target[s] = isArrow(f) ? function(...args) { return f(this, ...args); } : f;
    target[s].configurable = true;
  } );

  return s;
}

function addWithParams(targetOrTargets, f, { symbolName = f?.name } = {}) {
  const s = Symbol(symbolName);

  return {
    intermediate: function(...args) {
      targetOrTargets.forEach( target =>
        Object.defineProperty( target, s, {
          configurable: true,
          get: function() { return isArrow(f) ? f(this, ...args) : f.apply(this, args); },
        }) );
      return s; } }.intermediate;
}

function addSimple(targetOrTargets, f, {symbolName = f?.name}={}) {
  const s = Symbol(symbolName);
  targetOrTargets
    .forEach(target => Object.defineProperty(target, s, {
      configurable: true,
      get: isArrow(f) ? function() {return f(this);} : f }) );
  return s;
}

function hasArgs() {
  const checkArgs = fn => {
    const matched = String(fn)
      .replace(RegExp(`\\s+|function|${fn.name}`, `g`), ``)
      .match(/^\((?<multi>([^\)]+?))\)|(?<single>[a-z_,=]+?)?=>|{/).groups;
    return matched.multi || matched.single;
  };
  return this.length || checkArgs(this);
}