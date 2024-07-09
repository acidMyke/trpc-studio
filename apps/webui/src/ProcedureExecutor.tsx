import { useMutation, useQuery } from '@tanstack/react-query';
import { executeProcedure, getProcedure } from './api';
import ResizeableContainer from './components/ResizeableContainer';
import TabContainer from './components/TabContainer';

interface ProcedureExecutorProps {
  path?: string;
}

export function ProcedureExecutor({ path }: ProcedureExecutorProps) {
  const { data: procedures, isPending: isProcedurePending } = useQuery({
    queryKey: ['procedure', path],
    queryFn: ({ queryKey: [, path], signal }) => getProcedure(path!, signal),
  });
  const { data: response } = useMutation({
    mutationKey: ['procedure-execute', path],
    mutationFn: data => executeProcedure(path, 'mutation', data),
  });
  return (
    <ResizeableContainer minWidth='8rem' defaultWidth='40%'>
      {/* Request Headers and Body */}
      <TabContainer
        labelTitle='Request'
        defaultTab={1}
        label={['Headers', 'Input']}
      >
        <div className='flex flex-col h-full' />
        <div className='flex flex-col h-full' />
      </TabContainer>
      <TabContainer
        labelTitle='Response'
        defaultTab={1}
        label={['Headers', 'Output']}
      >
        <div className='flex flex-col h-full' />
        <div className='flex flex-col h-full' />
      </TabContainer>
    </ResizeableContainer>
  );
}
