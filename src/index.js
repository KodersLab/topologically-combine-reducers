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
    return (state, action) => {
        
        // new state
        var newState = {};
        
        // process the reducers
        order.forEach(key => {
            newState[key] = reducers[key](state[key], action, newState);
        });
        
        // return the new state
        return newState;
    }
}