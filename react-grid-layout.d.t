declare module 'react-grid-layout' {
  import { ComponentType } from 'react';

  export interface Layout {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    static?: boolean;
    isDraggable?: boolean;
    isResizable?: boolean;
    minW?: number;
    maxW?: number;
    minH?: number;
    maxH?: number;
  }

  export interface GridLayoutProps {
    className?: string;
    layout: Layout[];
    cols: number;
    rowHeight: number;
    width: number;
    onLayoutChange?: (layout: Layout[]) => void;
  }

  const GridLayout: ComponentType<GridLayoutProps>;
  export default GridLayout;
}