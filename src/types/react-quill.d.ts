declare module 'react-quill' {
  import { Component } from 'react';

  export interface ReactQuillProps {
    value?: string | any;
    defaultValue?: string | any;
    placeholder?: string;
    readOnly?: boolean;
    modules?: any;
    formats?: string[];
    theme?: string;
    style?: React.CSSProperties;
    className?: string;
    onChange?: (content: string, delta: any, source: any, editor: any) => void;
    onChangeSelection?: (selection: any, source: any, editor: any) => void;
    onFocus?: (selection: any, source: any, editor: any) => void;
    onBlur?: (previousSelection: any, source: any, editor: any) => void;
    onKeyPress?: (event: any) => void;
    onKeyDown?: (event: any) => void;
    onKeyUp?: (event: any) => void;
    tabIndex?: number;
    bounds?: string | HTMLElement;
    scrollingContainer?: string | HTMLElement;
    preserveWhitespace?: boolean;
  }

  export default class ReactQuill extends Component<ReactQuillProps> {}
}
