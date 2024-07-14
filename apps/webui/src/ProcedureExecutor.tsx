import { useQuery } from '@tanstack/react-query';
import { getInfo } from './api';
import SplitContainer from './components/SplitContainer';
import TabContainer from './components/TabContainer';
import {
  SubmitHandler,
  useFieldArray,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  useForm,
  UseFormRegister,
  UseFormSetFocus,
} from 'react-hook-form';
import { useCallback, useMemo, useRef, useState } from 'react';
import { X, CircleAlert } from 'lucide-react';
import { Combobox } from './components/Combobox';

interface Header {
  name: string;
  value: string;
  enabled: boolean;
}

interface FormInputs {
  headers: Header[];
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function ProcedureExecutor() {
  const {
    data: info,
    isLoading: isListLoading,
    isError: isListErrored,
  } = useQuery({
    queryKey: ['procedures'],
    queryFn: getInfo,
  });

  const prodcedureOptions = useMemo(() => {
    if (!info) return [] as { label: string; value: string }[];
    const opts: { label: string; value: string }[] = [];
    for (const [path, type] of Object.entries(info.procedures)) {
      if (type === 'subscription') continue; // Skip subscriptions for now
      opts.push({
        label: capitalizeFirstLetter(type) + ': ' + path,
        value: path,
      });
    }
    return opts;
  }, [info]);

  const [selectedPath, setSelectedPath] = useState<string | undefined>(
    undefined
  );
  // const { data: procedureData, isLoading: isProcedureDataLoading } = useQuery({
  //   queryKey: ['procedure', selectedPath],
  //   queryFn: ({ queryKey: [, path], signal }) => getProcedure(path!, signal),
  //   enabled: !!selectedPath,
  // });
  // const { data: response } = useMutation({
  //   mutationKey: ['procedure-execute', path],
  //   mutationFn: data => executeProcedure(path, 'mutation', data),
  // });

  const { control, register, handleSubmit, setFocus } = useForm<FormInputs>({
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
      {isListErrored ? (
        <div role='alert' className='alert alert-error flex-1 my-4 mx-6'>
          <CircleAlert size={16} />
          <span>Error fetching procedures</span>
        </div>
      ) : isListLoading ? (
        <div className='skeleton h-8 my-4 mx-6' />
      ) : (
        <div className='my-4 flex items-center gap-x-2 px-6'>
          <Combobox
            options={prodcedureOptions}
            value={selectedPath}
            onChange={setSelectedPath}
            placeholder='Select a procedure'
            className='flex-1'
          />
          <button
            type='submit'
            className='btn btn-primary btn-sm'
            disabled={!selectedPath}
          >
            {selectedPath
              ? `Use ${capitalizeFirstLetter(info?.procedures[selectedPath!]!)}`
              : 'Execute'}
          </button>
        </div>
      )}
      <SplitContainer
        minWidth='32rem'
        maxWidth='calc(100% - 32rem)'
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
                  setFocus={setFocus}
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
  register: UseFormRegister<FormInputs>;
  append: UseFieldArrayAppend<FormInputs>;
  remove: UseFieldArrayRemove;
  setFocus: UseFormSetFocus<FormInputs>;
}

function HeaderNameValue({
  index,
  length,
  register,
  append,
  remove,
  setFocus,
}: HeaderNameValueProps) {
  const enabledRef = useRef<HTMLInputElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const valueRef = useRef<HTMLInputElement | null>(null);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (nameRef.current?.value === '' && valueRef.current?.value === '') {
        remove(index);
        setFocus(index > 0 ? `headers.${index - 1}.value` : 'headers.0.value');
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
