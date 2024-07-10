import { MouseEventHandler, useCallback, useRef, useState } from 'react';

interface SplitContainerProps {
  children: [React.ReactNode, React.ReactNode];
  defaultWidth?: number | string;
  maxWidth?: number | string;
  minWidth?: number | string;
}

export default function SplitContainer({
  children,
  defaultWidth = '50%',
  maxWidth = '100%',
  minWidth = '0',
}: SplitContainerProps) {
  const mainRef = useRef<HTMLDivElement>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState<number | string>(
    defaultWidth
  );

  const onMouseDown: MouseEventHandler<HTMLDivElement> = useCallback(e => {
    e.preventDefault();
    const { current } = mainRef;
    if (!current) return;
    const mainStartX = current.getBoundingClientRect().left;
    const mainWidth = current.clientWidth;

    const onMouseMove = (e: MouseEvent) =>
      setLeftPanelWidth(((e.clientX - mainStartX) / mainWidth) * 100 + '%');
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener(
      'mouseup',
      () => window.removeEventListener('mousemove', onMouseMove),
      { once: true }
    );
  }, []);

  return (
    <div ref={mainRef} className='flex flex-row h-full'>
      <div style={{ width: leftPanelWidth, maxWidth, minWidth }}>
        {children[0]}
      </div>
      <div
        className='divider cursor-col-resize divider-horizontal !mx-0'
        onMouseDown={onMouseDown}
      />
      <div className='flex-1'>{children[1]}</div>
    </div>
  );
}
