/**
 * Type declarations for the Duktape built-in global object.
 * https://duktape.org/guide.html#builtin-duktape
 */
declare namespace Duktape {
  /**
   * Duktape version as (major * 10000) + (minor * 100) + patch.
   * E.g. 20600 = v2.6.0
   */
  const version: number;

  /**
   * Cryptic, version-dependent summary of the most important effective
   * compile options (endianness, architecture, OS, compiler, etc.).
   * Not intended to be parsed programmatically.
   */
  const env: string;

  /**
   * Get or set the finalizer of an object.
   * - Called with 1 arg: returns the current finalizer (or undefined).
   * - Called with 2 args: sets the finalizer; pass undefined to clear it.
   */
  function fin(o: object): ((x: object) => void) | undefined;
  function fin(o: object, finalizer: ((x: object) => void) | undefined): undefined;

  /**
   * Encode a value to hex, base64, JX, or JC.
   *
   * For "hex" / "base64": buffers are encoded as-is; other values are
   * string-coerced first. Returns a string.
   *
   * For "jx" / "jc": behaves like JSON.stringify(value, replacer?, space?).
   */
  function enc(format: "hex" | "base64", value: unknown): string;
  function enc(
    format: "jx" | "jc",
    value: unknown,
    replacer?: ((key: string, value: unknown) => unknown) | (string | number)[] | null,
    space?: string | number
  ): string;

  /**
   * Decode a value from hex, base64, JX, or JC.
   *
   * For "hex" / "base64": returns a plain buffer (object).
   * For "jx" / "jc": behaves like JSON.parse(text, reviver?).
   */
  function dec(format: "hex" | "base64", value: string): object; // plain buffer
  function dec(
    format: "jx" | "jc",
    text: string,
    reviver?: (key: string, value: unknown) => unknown
  ): unknown;

  /**
   * Get internal information about a value (heap address, alloc size, etc.).
   * The returned object's shape is version-specific and not stable across
   * minor versions.
   */
  function info(value: unknown): Record<string, unknown>;

  /**
   * Get information about a call stack entry by depth index.
   * Index -1 = innermost (top), -2 = one below, etc.
   * Returns undefined if the entry does not exist.
   * The returned object's shape is version-specific and not stable across
   * minor versions.
   */
  function act(depth: number): { lineNumber: number; pc: number; function: Function } | undefined;

  /**
   * Trigger a forced mark-and-sweep garbage collection.
   * @param flags Optional flags defined in duktape.h.
   */
  function gc(flags?: number): void;

  /**
   * Compact (minimize) the memory allocated for an object.
   * No-op for non-object arguments. Returns the argument unchanged.
   */
  function compact<T>(value: T): T;

  /**
   * Optional callback invoked when an error is created.
   * Can modify or replace the error object.
   * Set to undefined to disable.
   */
  let errCreate: ((err: Error) => Error | undefined) | undefined;

  /**
   * Optional callback invoked just before an error is thrown.
   * Can modify or replace the error object.
   * Set to undefined to disable.
   */
  let errThrow: ((err: Error) => Error | undefined) | undefined;

  // ── Pointer ──────────────────────────────────────────────────────────────

  /**
   * Pointer constructor.
   * Called as a function: coerces the argument to a plain pointer value.
   * Called as a constructor: returns a Pointer object wrapping the coerced pointer.
   */
  interface PointerObject {
    toString(): string;
    valueOf(): PointerObject;
  }

  interface PointerConstructor {
    new (value?: unknown): PointerObject;
    (value?: unknown): PointerObject; // plain pointer when called without new
    readonly prototype: PointerObject;
  }

  const Pointer: PointerConstructor;

  // ── Thread ────────────────────────────────────────────────────────────────

  /**
   * Thread (coroutine) object.
   */
  interface ThreadObject {}

  interface ThreadConstructor {
    new (fn: (...args: unknown[]) => unknown): ThreadObject;
    (fn: (...args: unknown[]) => unknown): ThreadObject;
    readonly prototype: ThreadObject;

    /**
     * Resume a target thread with a value (or error).
     * @param thread  The thread to resume.
     * @param value   The value (or error) to send into the thread.
     * @param isError If true, the value is thrown into the thread.
     */
    resume(thread: ThreadObject, value?: unknown, isError?: boolean): unknown;

    /**
     * Yield a value (or error) from the current thread.
     * @param value   The value (or error) to yield.
     * @param isError If true, the value is thrown to the resumer.
     */
    yield(value?: unknown, isError?: boolean): unknown;

    /** Get the currently running Thread object. */
    current(): ThreadObject;
  }

  const Thread: ThreadConstructor;
}