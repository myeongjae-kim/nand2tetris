import { SymbolTableImpl } from './SymbolTableImpl';

export class SubroutineSymbolTable extends SymbolTableImpl {
  constructor(private _subroutineName: string) {
    super();
  }

  public get subroutineName(): string {
    return this._subroutineName;
  }
}
