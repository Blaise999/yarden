import type { SVGProps } from 'react';

/** Clean ankh mark reflecting the recurring ankh motif used in Yarden's artwork. */
export default function AnkhMark(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 32 52" fill="none" stroke="currentColor" strokeWidth="3.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
    <path d="M16 25.5C11.3 20.8 7.4 15.3 7.4 10.5a8.6 8.6 0 0 1 17.2 0c0 4.8-3.9 10.3-8.6 15Z" />
    <path d="M16 25v25M2 31h28" />
  </svg>;
}
