const before = true;
/** Exported class documentation
 * Keep class docs visible.
 */
export class Example {
  run() {
    return 1;
  }
}
/** Exported function documentation
 * Keep function docs visible.
 */
export function create() {
  return new Example();
}
/** Default export documentation
 * Keep object docs visible.
 */
export default {
  /** Member documentation
   * Keep member docs visible.
   */
  run() {
    return create();
  }
};
const after = true;
