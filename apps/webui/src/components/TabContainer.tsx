import { ReactNode, useState } from 'react';

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
  className?: string;
}

export default function TabContainer<NumberOfTabs extends number>({
  children,
  label,
  labelTitle,
  className,
  defaultTab = 0,
}: TabContainerProps<NumberOfTabs>) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className={className}>
      <ul className='menu menu-horizontal'>
        {labelTitle && <h3 className='menu-title'>{labelTitle}</h3>}
        {label.map((tabLabel, index) => (
          <li>
            <a
              key={index}
              className={activeTab === index ? 'active' : ''}
              onClick={e => (e.preventDefault(), setActiveTab(index))}
            >
              {tabLabel}
            </a>
          </li>
        ))}
      </ul>
      <div>{children[activeTab]}</div>
    </div>
  );
}
