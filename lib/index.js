'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = topologicallyCombineReducers;

var _toposortClass = require('toposort-class');

var _toposortClass2 = _interopRequireDefault(_toposortClass);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
    return function () {
        var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
        var action = arguments[1];


        // process the reducers and return the newly combined state
        return order.reduce(function (state, key) {
            var oldChildState = state[key];
            var newChildState = reducers[key](oldChildState, action, state);

            // only create a new combined state if the child state changed
            if (oldChildState !== newChildState) {
                return _extends({}, state, _defineProperty({}, key, newChildState));
            }

            // otherwise return the old state object
            return state;
        }, state);
    };
}