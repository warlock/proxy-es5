//----- The ECMAScript 6 meta object protocol (MOP) implemented in ES5
// This is how getting a property is handled internally.
// Double underscore (__) implies internal operation.

Object.prototype.__Get__ = function (propKey, receiver) {
    receiver = receiver || this;
    var desc = this.__GetOwnProperty__(propKey);
    if (desc === undefined) {
        var parent = this.__GetPrototypeOf__();
        if (parent === null) return undefined;
        return parent.__Get__(propKey, receiver);
    }
    if ('value' in desc) {
        return desc.value;
    }
    var getter = desc.get;
    if (getter === undefined) return undefined;
    return getter.__Call__(receiver, []);
};
Object.prototype.__GetOwnProperty__ = function (propKey) {
    return Object.getOwnPropertyDescriptor(this, propKey);
};
Object.prototype.__Call__ = function (receiver, argArray) {
    this.apply(receiver, argArray);
};

//----- Example: __Get__ in use.

var obj = { bar: 123 };
var x = obj.__Get__('bar'); // obj.bar
console.log(x); // 123

//----- Implementing Proxy

function Proxy(target, handler) {
    this.__target__ = target;
    this.__handler__ = handler;
}
// Override default __Get__
Proxy.prototype.__Get__ = function (propKey, receiver) {
    // Omitted: invariant checks
    var getTrap = this.__handler__.get;
    if (getTrap) {
        return getTrap.call(handler, this.__target__, propKey, receiver);
    } else {
        return this.__target__.__Get__(propKey, receiver);
    }
};

//----- Example: Proxy in use

var handler = {
    get: function (target, propKey, receiver) {
        console.log('get ' + propKey);
        return 123;
    }
};
var proxy = new Proxy({}, handler);
console.log(proxy.__Get__('foo'));
// Output:
// get foo
// 123
