import React from 'react';
import ReactDOM from 'react-dom/client';
import { GameCanvas } from './game_canvas';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <GameCanvas />
    </React.StrictMode>
  );
}
