/*
    Mixin for providing basic subscriber model
*/
var emitter = {
    // Alert subscribers to an event
    fire: function(eventId, event) {
        var listeners = this._listeners || (this._listeners = {}),
            listenerGroup = listeners[eventId];
        
        if(listenerGroup) {
            listenerGroup.forEach(function(listener) {
                listener(event);
            });
        }
    },
    
    // Subscribe to a events of a certain type
    on: function(eventId, callback) {
        this._listeners = this._listeners || {};
        this._listeners[eventId] = this._listeners[eventId] || [];
        this._listeners[eventId].push(callback);
    },
    
    // Stop subscribing to events of a specific type
    off: function(eventId, callback) {
        var listenerGroup = this._listeners ? this._listeners[eventId] : null;
        if(listenerGroup) {
            listenerGroup.splice(listenerGroup.indexOf(callback), 1);
        }
    }
};

module.exports = emitter;