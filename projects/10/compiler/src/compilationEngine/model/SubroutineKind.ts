export const subroutineKinds = ['constructor', 'function', 'method'] as const;
export type SubroutineKind = (typeof subroutineKinds)[number];
export const isSubroutineKind = (value: string): value is SubroutineKind =>
  subroutineKinds.includes(value as SubroutineKind);
