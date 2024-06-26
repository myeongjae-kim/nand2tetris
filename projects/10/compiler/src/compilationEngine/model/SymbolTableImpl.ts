import { SymbolKind, SymbolTable } from './SymbolTable';

export type SymbolName = string;
export type MySymbol = {
  type: string;
  kind: SymbolKind;
  index: number;
};

export class SymbolTableImpl implements SymbolTable {
  private map: Map<SymbolName, MySymbol> = new Map();
  private indices: Record<SymbolKind, number> = {
    static: 0,
    field: 0,
    arg: 0,
    var: 0,
  };

  define(name: string, type: string, kind: SymbolKind): void {
    if (this.map.has(name)) {
      throw new Error('Symbol already defined');
    }

    const count = this.varCount(kind);
    this.map.set(name, { type, kind, index: count });
    this.indices[kind]++;
  }
  varCount(kind: SymbolKind): number {
    return this.indices[kind];
  }
  kindOf(name: string): SymbolKind | undefined {
    const symbol = this.map.get(name);
    if (!symbol) {
      return undefined;
    }
    return symbol.kind;
  }
  typeOf(name: string): string {
    const symbol = this.map.get(name);
    if (!symbol) {
      throw new Error('Symbol not found: ' + name);
    }
    return symbol.type;
  }
  indexOf(name: string): number {
    const symbol = this.map.get(name);
    if (!symbol) {
      throw new Error('Symbol not found: ' + name);
    }
    return symbol.index;
  }

  incrementIndex(kind: SymbolKind): void {
    this.indices[kind]++;
  }
}
