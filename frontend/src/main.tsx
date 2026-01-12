import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { /*BrowserRouter,*/ HashRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import { store } from './store'
import './index.css'


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <HashRouter>
        <Toaster position="top-right" />
        <App />
      </HashRouter>
    </Provider>
  </React.StrictMode>,
)