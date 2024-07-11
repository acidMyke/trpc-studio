import { useMutation, useQuery } from '@tanstack/react-query';
import { executeProcedure, getProcedure } from './api';
import SplitContainer from './components/SplitContainer';
import TabContainer from './components/TabContainer';
import {
  useFieldArray,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  useForm,
  UseFormRegister,
} from 'react-hook-form';
import { useCallback, useRef } from 'react';
import { X } from 'lucide-react';

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
    <SplitContainer
      minWidth='28rem'
      maxWidth='calc(100% - 28rem)'
      defaultWidth='40%'
    >
      {/* Request Headers and Body */}
      <TabContainer
        labelTitle='Request'
        defaultTab={1}
        label={['Headers', 'Input']}
      >
        <div className='flex flex-col h-full'>
          {/* Key value form for headers */}
          <HeaderForm
            headers={[]}
            setHeaders={() => {
              // do nothing
            }}
          />
        </div>
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
    </SplitContainer>
  );
}

type Header = {
  name: string;
  value: string;
  enabled: boolean;
};
interface HeaderFormProps {
  headers: Header[];
  setHeaders: (headers: Header[]) => void;
}

function HeaderForm({ headers, setHeaders }: HeaderFormProps) {
  const { control, register, handleSubmit } = useForm<{ headers: Header[] }>({
    defaultValues: {
      headers: headers.length
        ? headers
        : [{ name: '', value: '', enabled: false }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'headers',
  });

  const onSubmit = ({ headers }: { headers: Header[] }) => {
    setHeaders(headers);
  };

  return (
    <form
      className='flex flex-col gapy-2'
      autoComplete='off'
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Each row with header name and header value input field */}
      {fields.map((field, index) => {
        return (
          <HeaderNameValue
            key={field.id}
            index={index}
            length={fields.length}
            register={register}
            append={append}
            remove={remove}
          />
        );
      })}
    </form>
  );
}

interface HeaderNameValueProps {
  index: number;
  length: number;
  register: UseFormRegister<{ headers: Header[] }>;
  append: UseFieldArrayAppend<{ headers: Header[] }>;
  remove: UseFieldArrayRemove;
}

function HeaderNameValue({
  index,
  length,
  register,
  append,
  remove,
}: HeaderNameValueProps) {
  const enabledRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef<HTMLInputElement>(null);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (nameRef.current?.value === '' && valueRef.current?.value === '') {
        remove(index);
      } else if (index === length - 1 && e.target.value !== '') {
        append({ name: '', value: '', enabled: false }, { shouldFocus: false });
        enabledRef.current?.setAttribute('checked', 'true');
      }
    },
    [append, index, length, remove]
  );

  return (
    <div className='flex items-center gap-x-2 hover:bg-base-200'>
      <input
        className='checkbox checkbox-sm'
        type='checkbox'
        {...register(`headers.${index}.enabled` as const)}
        disabled={index === length - 1}
        ref={enabledRef}
      />
      <input
        className='input input-sm input-ghost flex-grow'
        type='text'
        {...register(`headers.${index}.name` as const)}
        placeholder='name'
        onChange={onChange}
        ref={nameRef}
      />
      <input
        className='input input-sm input-ghost flex-grow-[3]'
        type='text'
        {...register(`headers.${index}.value` as const)}
        placeholder='value'
        onChange={onChange}
        ref={valueRef}
      />
      <button
        type='button'
        className='btn btn-ghost btn-xs'
        onClick={() => remove(index)}
        disabled={index === length - 1}
      >
        <X size={16} />
      </button>
    </div>
  );
}
