import React from "react"
import { Switch, Route } from "react-router-dom"
import "./App.css"
import { AuthContext, store, DataProvider } from "rap-core"
import Login from "./login"
import { ThemeProvider, ThemeModeProvider } from "rap-ui"
import Home from "./home"
import { Provider } from "react-redux"

const App: React.FC<any> = () => {
  return (
    <Provider store={store}>
      <DataProvider>
        <ThemeProvider>
          <ThemeModeProvider>
            <AuthContext.Provider
              value={{
                login: async (data: any) => {
                  try {
                    if (data.username === "login") return Promise.resolve()
                    return Promise.reject()
                  } catch (e) {
                    console.warn(e)
                  }
                },
              }}
            >
              <div className="App">
                <header className="App-header">
                  <Switch>
                    <Route
                      exact
                      path="/"
                      component={(props: any) => <Home {...props} />}
                    />
                    <Route
                      path="/login"
                      component={(props: any) => <Login {...props} />}
                    />
                  </Switch>
                </header>
              </div>
            </AuthContext.Provider>
          </ThemeModeProvider>
        </ThemeProvider>
      </DataProvider>
    </Provider>
  )
}

export default App
