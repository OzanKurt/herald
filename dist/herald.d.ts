// Type declarations for @ozankurt/herald.

export type HeraldType = 'success' | 'error' | 'warning' | 'info';
export type HeraldTheme = 'default' | 'polished';
export type HeraldScheme = 'auto' | 'light' | 'dark';

/** A built-in icon name, or icon-font classes such as "fa fa-bell". */
export type HeraldIcon = 'bell' | 'warning' | 'shield' | 'check' | 'cross' | 'info' | 'thumbs' | 'cloud' | 'clock' | (string & {});

interface Common {
    /** Plain text. */
    title?: string;
    /** Trusted HTML instead of title. Never pass user input. */
    titleHtml?: string;
    /** Plain text. */
    content?: string;
    /** Trusted HTML instead of content. Never pass user input. */
    html?: string;
    type?: HeraldType;
    /** Any CSS colour; wins over type. */
    color?: string;
    icon?: HeraldIcon;
}

export interface ToastAction {
    label: string;
    variant?: 'danger';
    onClick?: () => void;
}

export interface ToastOptions extends Common {
    iconSmall?: HeraldIcon;
    /** Milliseconds; omit or 0 to keep the toast open. */
    timeout?: number;
    actions?: ToastAction[];
    /** Default true. */
    closeOnClick?: boolean;
    onClose?: () => void;
}

export interface ToastHandle {
    element: HTMLElement;
    close(): void;
}

export interface PanelOptions extends Common {
    /** Shown in the corner and on the parked tile. */
    number?: string | number;
    /** Milliseconds while visible; restarts when brought back. */
    timeout?: number;
    onClose?: () => void;
}

export interface PanelHandle {
    element(): HTMLElement | null;
    close(): void;
}

export interface AlertOptions extends Common {
    /** An array, or the SmartAdmin syntax "[No][Yes]". The last one is the main action. */
    buttons?: string | string[];
    input?: 'text' | 'password' | 'select';
    inputValue?: string;
    placeholder?: string;
    /** Choices for input: 'select', as an array or "[Red][Green]". */
    options?: string | string[];
    /** Default true: Escape closes the alert with button null. */
    dismissible?: boolean;
}

export interface AlertResult {
    /** The pressed button's label, or null when dismissed. */
    button: string | null;
    /** The input's value, or null without an input. */
    value: string | null;
}

export interface HeraldSettings {
    theme: HeraldTheme;
    scheme: HeraldScheme;
}

export declare function toast(options?: ToastOptions): ToastHandle;
export declare function panel(options?: PanelOptions): PanelHandle;
export declare function alert(
    options?: AlertOptions,
    callback?: (button: string | null, value: string | null) => void,
): Promise<AlertResult>;
export declare function configure(options?: Partial<HeraldSettings>): void;

declare const Herald: {
    toast: typeof toast;
    panel: typeof panel;
    alert: typeof alert;
    configure: typeof configure;
    settings(): HeraldSettings;
    /** Remove everything Herald has put on the page and restore the default settings. */
    reset(): void;
};

export default Herald;
