export type SymbolKind = 'static' | 'field' | 'arg' | 'var';

export interface SymbolTable {
  define(name: string, type: string, kind: SymbolKind): void;
  varCount(kind: SymbolKind): number;
  kindOf(name: string): SymbolKind | undefined;
  typeOf(name: string): string;
  indexOf(name: string): number;
}
