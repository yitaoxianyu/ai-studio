import { configureStore, combineReducers } from '@reduxjs/toolkit'
import conversationsReducer from './slices/conversations'
import assistantsReducer from './slices/assistants'
import settingsReducer from './slices/settings'
import modelsReducer from './slices/models'
import { persistStore, persistReducer } from 'redux-persist'
import electronStoreStorage from './electronStoreStorage'

const persistConfig = {
  key: 'ai-studio-root',
  storage: electronStoreStorage,
  whitelist: ['conversations', 'settings', 'models'],
  timeout: 10000,
}

const rootReducer = combineReducers({
  conversations: conversationsReducer,
  assistants: assistantsReducer,
  settings: settingsReducer,
  models: modelsReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/FLUSH', 'persist/PAUSE', 'persist/PURGE', 'persist/REGISTER'],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
