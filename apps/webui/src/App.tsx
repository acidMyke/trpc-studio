import { useState } from 'react';
import { ThemeProvider } from './providers/theme';
import ResizeableContainer from './components/ResizeableContainer';

function App() {
  return (
    <div className='fixed inset-0'>
      <ThemeProvider>
        <ResizeableContainer>
          <div>Left</div>
          <div>Right</div>
        </ResizeableContainer>
      </ThemeProvider>
    </div>
  );
}

export default App;
