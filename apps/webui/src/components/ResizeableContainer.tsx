import { MouseEventHandler, useCallback, useState } from 'react';

interface ResizeableContainerProps {
  children: [React.ReactNode, React.ReactNode];
  defaultWidth?: number | string;
  maxWidth?: number | string;
  minWidth?: number | string;
}

export default function ResizeableContainer({
  children,
  defaultWidth = '50%',
  maxWidth = '100%',
  minWidth = '0',
}: ResizeableContainerProps) {
  const [leftPanelWidth, setLeftPanelWidth] = useState<number | string>(
    defaultWidth
  );

  const onMouseDown: MouseEventHandler<HTMLDivElement> = useCallback(e => {
    e.preventDefault();
    setLeftPanelWidth(width => width ?? e.clientX);

    const onMouseMove = (e: MouseEvent) => setLeftPanelWidth(e.clientX);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener(
      'mouseup',
      () => window.removeEventListener('mousemove', onMouseMove),
      { once: true }
    );
  }, []);

  return (
    <div className='flex flex-row h-full'>
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
