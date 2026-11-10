import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/saira-condensed/latin-600.css';
import '@fontsource/saira-condensed/latin-800.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import 'lenis/dist/lenis.css';
import './styles/index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
