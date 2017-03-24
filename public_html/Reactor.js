/* https://gist.github.com/mohsen1/5123533 */

function Event(name) {
    this.name = name;
    this.callbacks = [];
}
Event.prototype.registerCallback = function (callback) {
    this.callbacks.push(callback);
};

function Reactor() {
    this.events = {};
}

Reactor.prototype.registerEvent = function (eventName) {
    if (this.events[eventName] !== undefined)
    {
        throw "Reactor: event already exists: " + eventName;
    }
    var event = new Event(eventName);
    this.events[eventName] = event;
};

Reactor.prototype.dispatchEvent = function (eventName, eventArg1, eventArg2, eventArg3) {
    this.events[eventName].callbacks.forEach(function (callback) {
        callback(eventArg1, eventArg2, eventArg3);
    });
};

Reactor.prototype.addEventListener = function (eventName, callback) {
    if (this.events[eventName] === undefined) {
        console.log((new Error()).stack);
    }
    this.events[eventName].registerCallback(callback);
};