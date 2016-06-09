import Toposort from 'toposort-class';

export default function topologicallyCombineReducers(reducers, dependencies = {}){
    // create the toposort class
    var ts = new Toposort();

    // add the dependencies into toposort class
    Object.keys(reducers)
        .forEach(key => {
            ts = ts.add(key, dependencies[key] || [])
        });

    // create the processing order
    var order = ts.sort().reverse();

    // return the combined reducer
    return (state = {}, action) => {

        // process the reducers and return the newly combined state
        return order.reduce((state, key) => {
            var oldChildState = state[key];
            var newChildState = reducers[key](oldChildState, action, state);

            // only create a new combined state if the child state changed
            if (oldChildState !== newChildState) {
              return { ...state, [key]: newChildState };
            }

            // otherwise return the old state object
            return state;
        }, state);
    }
}
