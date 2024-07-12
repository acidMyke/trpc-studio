import { useMutation, useQuery } from '@tanstack/react-query';
import { executeProcedure, getProcedure } from './api';
import SplitContainer from './components/SplitContainer';
import TabContainer from './components/TabContainer';
import {
  SubmitHandler,
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

interface Header {
  name: string;
  value: string;
  enabled: boolean;
}

interface FormInputs {
  headers: Header[];
}

export function ProcedureExecutor({ path }: ProcedureExecutorProps) {
  const { data: procedure, isPending: isProcedurePending } = useQuery({
    queryKey: ['procedure', path],
    queryFn: ({ queryKey: [, path], signal }) => getProcedure(path!, signal),
    enabled: !!path,
  });
  // const { data: response } = useMutation({
  //   mutationKey: ['procedure-execute', path],
  //   mutationFn: data => executeProcedure(path, 'mutation', data),
  // });

  const { control, register, handleSubmit } = useForm<FormInputs>({
    defaultValues: {
      headers: [{ name: '', value: '', enabled: false }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'headers',
  });

  const onSubmit: SubmitHandler<FormInputs> = data => {
    console.log(data);
  };

  return (
    <form
      className='flex flex-col h-full'
      autoComplete='off'
      spellCheck={false}
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Header and execute button */}
      <div className='my-4 flex items-center gap-x-2 px-6'>
        {!path ? (
          <p className='text-lg text-base-content'>
            Select a procedure to execute
          </p>
        ) : isProcedurePending ? (
          <div className='skeleton h-8 flex-1' />
        ) : (
          <>
            <h2 className='text-lg text-base-content flex-1'>{path}</h2>
            <button type='submit' className='btn btn-success btn-sm'>
              {procedure?.type === 'query' ? 'Use Query' : 'Use Mutation'}
            </button>
          </>
        )}
      </div>
      <SplitContainer
        minWidth='28rem'
        maxWidth='calc(100% - 28rem)'
        defaultWidth='40%'
      >
        {/* Header */}
        {/* Request Headers and Body */}

        <TabContainer
          labelTitle='Request'
          defaultTab={1}
          label={['Headers', 'Input']}
        >
          {/* Key value form for headers */}
          <div className='flex flex-col h-full gap-y-1'>
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
  const enabledRef = useRef<HTMLInputElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const valueRef = useRef<HTMLInputElement | null>(null);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log(
        'onChange',
        enabledRef.current,
        nameRef.current,
        valueRef.current
      );
      if (nameRef.current?.value === '' && valueRef.current?.value === '') {
        remove(index);
      } else if (index === length - 1 && e.target.value !== '') {
        append({ name: '', value: '', enabled: false }, { shouldFocus: false });
        if (enabledRef.current) enabledRef.current.checked = true;
      }
    },
    [append, index, length, remove]
  );

  return (
    <div
      className='flex items-center gap-x-2 hover:bg-base-200'
      ref={ref => {
        // Using parent ref to get child refs because ref for inputs are set by react-hook-form
        enabledRef.current = ref?.firstChild as HTMLInputElement;
        nameRef.current = ref?.children[1] as HTMLInputElement;
        valueRef.current = ref?.children[2] as HTMLInputElement;
      }}
    >
      <input
        className='checkbox checkbox-sm'
        type='checkbox'
        {...register(`headers.${index}.enabled` as const)}
        disabled={index === length - 1}
        // ref={enabledRef}
      />
      <input
        className='input input-sm input-ghost flex-grow'
        type='text'
        {...register(`headers.${index}.name` as const)}
        placeholder='name'
        onChange={onChange}
        // ref={nameRef}
      />
      <input
        className='input input-sm input-ghost flex-grow-[3]'
        type='text'
        {...register(`headers.${index}.value` as const)}
        placeholder='value'
        onChange={onChange}
        // ref={valueRef}
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
