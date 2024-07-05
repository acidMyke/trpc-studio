import { useState } from 'react';
import { ThemeProvider } from './providers/theme';

function App() {
  return (
    <ThemeProvider>
      <div></div>
    </ThemeProvider>
  );
}

export default App;
