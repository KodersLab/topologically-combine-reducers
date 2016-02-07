# topologically-combine-reducers
Inspired by a @gaeron comment at @londonreact, a way to combine reducers by their dependencies and access at their ancestor's values.

### How to use?
This module behaves like combineReducers, but takes as second argument an object which defines the dependency tree.
First install via ```npm install topologically-combine-reducers```, then use in your code like so:
```javascript
import topologicallyCombineReducers from 'topologically-combine-reducers';
import {auth, users, todos} from './reducers';

var masterReducer = topologicallyCombineReducers(
    // pass in the object-of-reducers-functions
    {auth, users, todos}, 
    // define the dependency tree
    {
        users: [], // could be omitted.
        auth: ['users'],
        todos: ['auth']
    }
);
```
Now, the users, auth and todos reducer will be called with an object as the third argument containing the state tree of the dependent reducers.

```javascript
export function users(state = {}, action){
    // ...just handle an object with the id as key
}

export function auth(loggedUser = null, action, {users}){
    // ...using ES6 destructuring, users will contain the updated users object
}

export function todos(todos = {}, action, {users, auth}){
    // now, your reducer knows all about users and auth, so you can check if user is logged and exists.
    
    // (if no auth is provided, or user is missing in users, do nothing.)
    if(!auth || !users[auth]) return todos;
    
    // Hey! Now in your reducer you can handle user_id! :D
    switch(action.type){
        // ...
        case ADD:
            return {
                ...todos,
                [newId]: {
                    user_id: auth,
                    task: action.payload
                }
            };
        // ...
    }
}
```

And what about testing? As you can imagine, to test these reducer you just have to pass as third argument an object of their dependency.
This way you could also handle custom edge-case testing like save a task as unlogged user and handle it after when the user is finally logged.
```javascript
assert(
    // call the reducer
    todos(
        {}, 
        addTodoActionCreator('Learn advanced redux usage'), 
        {auth: '1', users: {'1': {username: 'mattiamanzati'}}}
    ), 
    // expected output
    {'1': {user_id: '1', task: 'Learn advanced redux usage'}}
);
```

### This can solve
- **Accessing ancestor reducer's data** (e.g. accessing current logged user_id)
- **Let the integrity checks live in the reducer** (e.g. if we are adding a todo with a non existing user_id in the users reducers, do nothing.)
- **Writing tests for reducer with dependency to other reducers data** (e.g. auth reducer will depend on users reducer, instead of creating the entire app store for each test, you could simply pass in as third argument of the reducer the state of the users reducer at that time)
- **Time travel problems with redux-thunk** (e.g. action contains some data that cames from getState(), and this may change during time travelling)
- **Writing modular apps in redux** (e.g. each module exports an index.js with the dependencies list and the reducer, and you can construct the masterReducer using that dependencies tree)

### The problem
Imagine a multi-user app, with lot of features and a modular structure.
You will mostly have two or three different reducers: the auth reducers, the users reducers and (for example) the todos reducer.

Your state tree will almost look like these:
```javascript
{
    auth: 'mattiamanzati access token', 
    usersById: {
        1: {username: 'mattiamanzati', token: 'mattiamanzati access token'},
        2: {username: 'another user', token: 'another user access token'}
    },
    todosById: {
        1: {user_id: 1, task: 'Have a sleep'},
        2: {user_id: 2, task: 'Have a drink'}
    }
}
```

Now when you write down the todos reducer the problem cames along... how do I get the current logged user and automatically append it? Well, you could use redux-thunk and get the current user id with the getState() function and then attach the user id in the action. 
But this way you will create two different action creators for a single action, and **there is no integrity check while performing the mutation on the state tree** by the reducer. Also, **using redux-thunk could break time travelling**, because you getState() and re-dispatch an action with the user_id just got.