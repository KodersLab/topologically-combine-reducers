'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = topologicallyCombineReducers;

var _toposortClass = require('toposort-class');

var _toposortClass2 = _interopRequireDefault(_toposortClass);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function topologicallyCombineReducers(reducers) {
    var dependencies = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    // create the toposort class
    var ts = new _toposortClass2.default();

    // add the dependencies into toposort class
    Object.keys(reducers).forEach(function (key) {
        ts = ts.add(key, dependencies[key] || []);
    });

    // create the processing order
    var order = ts.sort().reverse();

    // return the combined reducer
    return function (state, action) {

        // new state
        var newState = {};

        // process the reducers
        order.forEach(function (key) {
            newState[key] = reducers[key](state[key], action, newState);
        });

        // return the new state
        return newState;
    };
}