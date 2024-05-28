import { SymbolTableImpl } from './SymbolTableImpl';

type BranchKind = 'while' | 'if';

export class SubroutineSymbolTable extends SymbolTableImpl {
  private branchCounts: Record<'while' | 'if', number> = {
    while: 0,
    if: 0,
  };

  constructor(private _subroutineName: string) {
    super();
  }

  public get subroutineName(): string {
    return this._subroutineName;
  }

  public increaseBranchCount(kind: BranchKind): void {
    this.branchCounts[kind]++;
  }

  public getBranchCount(kind: BranchKind): number {
    return this.branchCounts[kind];
  }
}
