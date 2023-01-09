import ReactDOM from 'react-dom/client';
import './index.less';

import App from './App';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('groot-workbench-root') as HTMLElement).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
