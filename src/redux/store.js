import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';

import devReducer from './reducers';

const rootReducer = combineReducers({devReducer});

export const store = createStore(rootReducer, applyMiddleware(thunk));
