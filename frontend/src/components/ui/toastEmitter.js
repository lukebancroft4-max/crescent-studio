/**
 * Imperative toast API.
 * Import and call from anywhere:
 *   import { toast } from "./toastEmitter";
 *   toast.success("Saved!");
 */

let externalEmit = null;
let toastId = 0;

export function _setEmitter(fn) {
  externalEmit = fn;
}

function emit(type, message, opts = {}) {
  if (externalEmit) externalEmit({ id: ++toastId, type, message, ...opts });
}

export const toast = {
  success: (msg, opts) => emit("success", msg, opts),
  error: (msg, opts) => emit("error", msg, opts),
  warning: (msg, opts) => emit("warning", msg, opts),
  info: (msg, opts) => emit("info", msg, opts),
};
