import 'react';

// React 18 forwards this native HTML attribute as an empty string.
// It keeps the collapsed mobile navigation out of the keyboard focus order.
declare module 'react' {
  // React's declaration requires the same generic parameter, even though this addition does not use it.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface HTMLAttributes<T> {
    inert?: '';
  }
}
