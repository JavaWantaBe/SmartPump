var request = require("superagent");

/*
    Attaches and removes update listeners from a given store
    when the component using this mixin mounts/unmounts
*/
function storeListener(store, options) {
    options = options || {
        reloadOnRefresh: false
    };

    return {
        getInitialState: function() {
            return store.getState();
        },

        load: function() {
            request.get(store.path, (response) => {
                if(response.status === 401) {
                    this.transitionTo("login");
                }
                else {
                    store.setData(JSON.parse(response.text));
                }
            });
        },

        save: function(newData) {
            request.post(store.path, newData, (response) => {
                if(response.status === 401) {
                    this.transitionTo("login");
                }
                else {
                    store.setData(JSON.parse(response.text));
                }
            });
        },

        componentWillMount: function() {
            var _updateHandler = () => {
                this.setState(store.getState());
            };
            this._updateHandler = _updateHandler;
            store.on("update", _updateHandler);
            if(!store.loaded || options.reloadOnRefresh) {
                this.load();
            }
        },

        componentWillUnmount: function() {
            if(this._updateHandler) {
                store.off("update", this._updateHandler);
            }
        }
    };
}

module.exports = storeListener;