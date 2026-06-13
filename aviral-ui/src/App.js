import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import theme from '../theme';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Schools from './pages/Schools';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Notices from './pages/Notices';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/schools" element={<Schools />} />
            <Route path="/students" element={<Students />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/notices" element={<Notices />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;