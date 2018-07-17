import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';

import 'modern-normalize/modern-normalize.css';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
