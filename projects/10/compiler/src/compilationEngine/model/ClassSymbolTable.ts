import { SymbolTableImpl } from './SymbolTableImpl';

export class ClassSymbolTable extends SymbolTableImpl {
  constructor(private _className: string) {
    super();
  }

  public get className(): string {
    return this._className;
  }
}
