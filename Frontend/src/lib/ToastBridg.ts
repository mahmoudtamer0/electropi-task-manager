type ToastType = "success" | "error";
type Handler = (type: ToastType, message: string) => void;

let handler: Handler | null = null;

export function registerToastHandler(fn: Handler) {
    handler = fn;
}

export function emitToast(type: ToastType, message: string) {
    if (handler) {
        handler(type, message);
    } else {
        console.log(`[${type}] ${message}`);
    }
}