import React from 'react';
import Test from "./pages/test";
import { CssBaseline, ThemeProvider, Box } from "@mui/material";
import { createTheme } from "@mui/material/styles"; 
import {
  BrowserRouter as Router,
  Route,
  Routes
} from 'react-router-dom';
import Layout from './components/layout';
import { routes as appRoutes } from "./routes";
import { Route as AppRoute } from './types';

function App() {
  const theme = createTheme();

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route element={<Layout />}>
            {
              appRoutes.map((route: AppRoute) => (
                <Route key={route.key} path={route.path} element={<route.component />} />
              ))
            }
            </Route>
          </Routes>
        </Router>
      </Box>
    </ThemeProvider>
  );
}

export default App;
