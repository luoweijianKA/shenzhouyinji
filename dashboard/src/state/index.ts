import { configureStore } from '@reduxjs/toolkit';
import { save, load } from 'redux-localstorage-simple';

import application from './application/reducer'
import account from './account/reducer'

const PERSISTED_KEYS: string[] = ['account'];

const store = configureStore({
  reducer: {
    application,
    account
  },
  middleware: [
    save({ states: PERSISTED_KEYS }),
  ],
  preloadedState: load({ states: PERSISTED_KEYS }),
});

export default store;

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
