import { useState } from 'react';
import { ThemeProvider } from './providers/theme';
import ResizeableContainer from './components/ResizeableContainer';
import { getProcedures } from './api';
import { useQuery } from '@tanstack/react-query';
import { twMerge } from 'tailwind-merge';

const procedureUi = {
  query: ['Q', 'badge-primary'],
  mutation: ['M', 'badge-secondary'],
  subscription: ['S', 'badge-error'],
} as const;

interface ProcedureMenuItemProps {
  path: string;
  type: keyof typeof procedureUi;
}

function ProcedureMenuItem({ path, type }: ProcedureMenuItemProps) {
  const [icon, color] = procedureUi[type];
  return (
    <li key={path} className={type === 'subscription' ? 'disabled' : ''}>
      <a onClick={e => e.preventDefault()}>
        <span className={twMerge('badge inline', color)}>{icon}</span>
        {path}
      </a>
    </li>
  );
}

function App() {
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
                <ProcedureMenuItem key={path} path={path} type={type} />
              ))}
            </ul>
          )}
          <div className='flex flex-col h-full'></div>
        </ResizeableContainer>
      </ThemeProvider>
    </div>
  );
}

export default App;
