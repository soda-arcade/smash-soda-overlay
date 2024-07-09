import Config from "@/models/Config";

export { }

declare global {
    interface Window {
        $eventBus: {
            on: (event: string, callback: (data?: any) => void) => void;
            off: (event: string, callback: (data?: any) => void) => void;
            emit: (event: string, data?: any) => void;
        };
        electron: {
            send: (channel: string, data: any) => void;
            on: (channel: string, listener: (...args: any[]) => void) => void;
            removeListener: (channel: string, listener: (...args: any[]) => void) => void;
            removeAllListeners: (channel: string) => void;
            focus: () => void;
            blur: () => void;
            chat: (message: string) => void;
        };
        $config: Config;
        $designMode: boolean;
        $customCSS: string;
    }

    interface CSSStyleDeclaration {
        zoom?: string;
    }
}
  