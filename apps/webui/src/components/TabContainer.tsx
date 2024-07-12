import { ReactNode, useId, useState } from 'react';

// FixedLengthArray is a utility type that creates a fixed-length array type
// Modified from sindresorhus/type-fest
type ArrayLengthMutationKeys = 'splice' | 'push' | 'pop' | 'shift' | 'unshift';
type FixedLengthArray<
  Length extends number,
  Element,
  ArrayPrototype = [Element, ...Element[]]
> = Pick<
  ArrayPrototype,
  Exclude<keyof ArrayPrototype, ArrayLengthMutationKeys>
> & {
  [index: number]: Element;
  [Symbol.iterator]: () => IterableIterator<Element>;
  readonly length: Length;
};
// End of copied code

interface TabContainerProps<NumberOfTabs extends number> {
  children: FixedLengthArray<NumberOfTabs, ReactNode>;
  label: FixedLengthArray<NumberOfTabs, string>;
  labelTitle?: string;
  defaultTab?: number;
}

export default function TabContainer<NumberOfTabs extends number>({
  children,
  label,
  labelTitle,
  defaultTab = 0,
}: TabContainerProps<NumberOfTabs>) {
  const name = useId();
  return (
    <div role='tablist' className='tabs tabs-lifted w-full'>
      {labelTitle && (
        <input
          key='title'
          type='radio'
          name={name}
          role='tab'
          className='tab !cursor-default'
          aria-label={labelTitle}
          disabled
        />
      )}
      {label.map((tabLabel, index) => {
        return (
          <>
            <input
              key={index}
              type='radio'
              name={name}
              role='tab'
              className='tab'
              aria-label={tabLabel}
              defaultChecked={defaultTab === index}
            />
            <div
              role='tabpanel'
              className='tab-content bg-base-100 border-base-300 rounded-box p-3'
            >
              {children[index]}
            </div>
          </>
        );
      })}
    </div>
  );
}
