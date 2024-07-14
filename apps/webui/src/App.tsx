import { ThemeProvider } from './providers/theme';
import { ProcedureExecutor } from './ProcedureExecutor';

function App() {
  return (
    <div className='fixed inset-0'>
      <ThemeProvider>
        <ProcedureExecutor />
      </ThemeProvider>
    </div>
  );
}

export default App;
