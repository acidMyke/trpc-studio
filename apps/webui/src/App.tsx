import { useState } from 'react';
import { ThemeProvider } from './providers/theme';
import ResizeableContainer from './components/ResizeableContainer';
import { getProcedures } from './api';
import { useQuery } from '@tanstack/react-query';
import { twMerge } from 'tailwind-merge';
import { ProcedureExecutor } from './ProcedureExecutor';

const procedureUi = {
  query: ['Q', 'badge-primary'],
  mutation: ['M', 'badge-secondary'],
  subscription: ['S', 'badge-error'],
} as const;

interface ProcedureMenuItemProps {
  path: string;
  type: keyof typeof procedureUi;
  onClick: () => void;
}

function ProcedureMenuItem({ path, type, onClick }: ProcedureMenuItemProps) {
  const [icon, color] = procedureUi[type];
  return (
    <li key={path} className={type === 'subscription' ? 'disabled' : ''}>
      <a
        onClick={e => {
          e.preventDefault();
          onClick();
        }}
      >
        <span className={twMerge('badge inline', color)}>{icon}</span>
        {path}
      </a>
    </li>
  );
}

function App() {
  const [selectedPath, setSelectedPath] = useState<string | undefined>(
    undefined
  );
  const { data: procedures, isPending: isProcedurePending } = useQuery({
    queryKey: ['procedures'],
    queryFn: getProcedures,
  });

  return (
    <div className='fixed inset-0'>
      <ThemeProvider>
        <ResizeableContainer
          defaultWidth='16rem'
          maxWidth='24rem'
          minWidth='8rem'
        >
          {isProcedurePending || !procedures ? (
            <div className='skeleton h-full w-full' />
          ) : (
            <ul className='h-full w-full menu bg-base-200 overflow-clip'>
              {Object.entries(procedures)?.map(([path, type]) => (
                <ProcedureMenuItem
                  key={path}
                  path={path}
                  type={type}
                  onClick={() => setSelectedPath(path)}
                />
              ))}
            </ul>
          )}
          <ProcedureExecutor path={selectedPath} />
        </ResizeableContainer>
      </ThemeProvider>
    </div>
  );
}

export default App;
