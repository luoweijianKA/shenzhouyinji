import React, { StrictMode } from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import { ApolloClient, createHttpLink, InMemoryCache, ApolloProvider, from, defaultDataIdFromObject } from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import { setContext } from '@apollo/client/link/context'
import store from './state'
import App from './pages/App'
import './i18n';
import 'react-datepicker/dist/react-datepicker.css'
import './css/bootstrap.min.css'
import './css/app.css'
import ApplicationUpdater from './state/application/updater'
import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from './theme'

window.addEventListener('error', error => {
  console.error(error)
})

const httpLink = createHttpLink({
  uri: `${process.env.REACT_APP_BACKEND_URL}/query`,
  credentials: 'include',
})

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    )
  }

  if (networkError) {
    const error: any = networkError
    if (error["statusCode"] === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('redux_localstorage_simple_account')
      window.open("/")
    }
  }
})

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('accessToken')
  
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
})

const client = new ApolloClient({
  cache: new InMemoryCache({
    dataIdFromObject(responseObject) {
      return defaultDataIdFromObject(responseObject)
    }
  }),
  link: from([errorLink, authLink.concat(httpLink)]),
})

function Updaters() {
  return (
    <>
      <ApplicationUpdater />
    </>
  )
}

setTimeout(() => {
  render(
    <StrictMode>
      <FixedGlobalStyle />
      <ApolloProvider client={client}>
      <Provider store={store}>
          <Updaters />
          <ThemeProvider>
            <ThemedGlobalStyle />
            <HashRouter>
              <App />
            </HashRouter>
          </ThemeProvider>
        </Provider>
      </ApolloProvider>
    </StrictMode>,
    document.getElementById('root')
  )
}, 100)