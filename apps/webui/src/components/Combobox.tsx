// Combobox made with daisyUi components

import { useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { ChevronDown } from 'lucide-react';

type ValueLabel = { value: string; label: string };

interface ComboboxProps {
  options: string[] | ValueLabel[];
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder,
  className,
}: ComboboxProps) {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const ddRef = useRef<HTMLDetailsElement>(null);

  const filteredOptions = options.filter(option => {
    if (typeof option === 'string') {
      return option.toLowerCase().includes(search.toLowerCase());
    }
    return (
      option.label.toLowerCase().includes(search.toLowerCase()) ||
      option.value.toLowerCase().includes(search.toLowerCase())
    );
  });

  const displayLabel =
    typeof options[0] === 'string'
      ? value
      : (options as ValueLabel[]).find(option => option.value === value)?.label;

  return (
    <details
      ref={ddRef}
      className='dropdown'
      onBlur={e => {
        if (!ddRef.current?.contains(e.relatedTarget as Node)) {
          ddRef.current?.open && ddRef.current?.removeAttribute('open');
        }
      }}
    >
      <summary
        className={twMerge(
          'btn btn-sm',
          value ? undefined : 'text-opacity-80',
          className
        )}
      >
        {displayLabel ?? placeholder}
        <ChevronDown size={16} />
      </summary>
      <ul className='menu dropdown-content bg-base-100 rounded-box z-10 w-min p-2 shadow-lg'>
        <li key='search'>
          <input
            ref={inputRef}
            type='text'
            className='input input-bordered input-sm'
            placeholder='Search'
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </li>
        {filteredOptions.map((option, index) => {
          const label = typeof option === 'string' ? option : option.label;
          const value = typeof option === 'string' ? option : option.value;

          return (
            <li key={index} tabIndex={0}>
              <a
                onClick={e => {
                  e.preventDefault();
                  onChange(value);
                  setSearch('');
                  ddRef.current?.removeAttribute('open');
                }}
              >
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
