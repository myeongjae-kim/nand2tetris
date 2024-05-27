import { indentation } from '../utils/indentation';
import { parseSingleLineXml } from '../utils/parseSingleLineXml';
import { compileStatements } from './compileStatements';
import { compileVarDec } from './compileVarDec';
import { compileParameterList } from './compileParameterList';
import { ClassSymbolTable } from './model/ClassSymbolTable';
import { SubroutineSymbolTable } from './model/SubroutineSymbolTable';
import { vmWriter } from './model/VmWriter';
import { SubroutineKind } from './model/SubroutineKind';

export const compileSubroutineDec = (
  xmls: string[],
  indentLevel: number,
  classSymbolTable: ClassSymbolTable,
  subroutineKind: SubroutineKind,
  print: (xml: string) => void,
  printVm: (vm: string) => void,
): number => {
  print(indentation('<subroutineDec>', indentLevel - 1));

  let cursor = 0;
  const keywordXml = xmls[cursor++];
  const typeXml = xmls[cursor++];
  const subroutineNameXml = xmls[cursor++];

  print(indentation(keywordXml, indentLevel));
  print(indentation(typeXml, indentLevel));
  print(indentation(subroutineNameXml, indentLevel));

  const subroutineSymbolTable = new SubroutineSymbolTable(
    parseSingleLineXml(subroutineNameXml).value,
  );

  cursor += compileParameterList(
    xmls.slice(cursor),
    indentLevel + 1,
    subroutineSymbolTable,
    print,
    printVm,
  );

  cursor += _compileSubroutineBody(
    xmls.slice(cursor),
    indentLevel + 1,
    classSymbolTable,
    subroutineSymbolTable,
    subroutineKind,
    print,
    printVm,
  );

  print(indentation('</subroutineDec>', indentLevel - 1));

  return cursor;
};

const _compileSubroutineBody = (
  xmls: string[],
  indentLevel: number,
  classSymbolTable: ClassSymbolTable,
  subroutineSymbolTable: SubroutineSymbolTable,
  subroutineKind: SubroutineKind,
  print: (xml: string) => void,
  printVm: (vm: string) => void,
): number => {
  print(indentation('<subroutineBody>', indentLevel - 1));

  let cursor = 0;
  const subroutineBodyStartSymbolXml = xmls[cursor++];
  print(indentation(subroutineBodyStartSymbolXml, indentLevel));

  cursor += _handleSubroutineBody(
    xmls.slice(cursor),
    indentLevel,
    classSymbolTable,
    subroutineSymbolTable,
    subroutineKind,
    print,
    printVm,
  );

  print(indentation(xmls[cursor++], indentLevel));
  print(indentation('</subroutineBody>', indentLevel - 1));

  return cursor;
};

const _handleSubroutineBody = (
  xmls: string[],
  indentLevel: number,
  classSymbolTable: ClassSymbolTable,
  subroutineSymbolTable: SubroutineSymbolTable,
  subroutineKind: SubroutineKind,
  print: (xml: string) => void,
  printVm: (vm: string) => void,
): number => {
  let _cursor = 0;
  const nextXml = xmls[_cursor];
  if (!nextXml) {
    return _cursor;
  }

  const varDecResult = compileVarDec(
    xmls.slice(_cursor),
    indentLevel + 1,
    classSymbolTable,
    subroutineSymbolTable,
    'var',
    print,
    printVm,
  );

  _cursor += varDecResult.cursorProcessed;

  printVm(
    vmWriter.writeFunction(
      classSymbolTable.className,
      subroutineSymbolTable.subroutineName,
      varDecResult.totalVarDecs,
    ),
  );

  if (subroutineKind === 'constructor') {
    const fieldCount = classSymbolTable.varCount('field');
    printVm(vmWriter.writePush('constant', fieldCount));
    printVm(vmWriter.writeCall('Memory.alloc', 1));
    printVm(vmWriter.writePop('pointer', 0));
  }

  const { value } = parseSingleLineXml(xmls[_cursor]);

  if (['let', 'if', 'while', 'do', 'return'].includes(value)) {
    print(indentation('<statements>', indentLevel));
    _cursor += _handleSubroutineStatements(
      xmls.slice(_cursor),
      indentLevel,
      classSymbolTable,
      subroutineSymbolTable,
      print,
      printVm,
    );
    print(indentation('</statements>', indentLevel));
  }

  return _cursor;
};

const _handleSubroutineStatements = (
  xmls: string[],
  indentLevel: number,
  classSymbolTable: ClassSymbolTable,
  subroutineSymbolTable: SubroutineSymbolTable,
  print: (xml: string) => void,
  printVm: (vm: string) => void,
): number => {
  let _cursor = 0;
  const nextXml = xmls[_cursor];

  if (!nextXml) {
    return _cursor;
  }

  const { value } = parseSingleLineXml(nextXml);

  if (['let', 'if', 'while', 'do', 'return'].includes(value)) {
    _cursor += compileStatements(
      xmls.slice(_cursor),
      indentLevel + 1,
      classSymbolTable,
      subroutineSymbolTable,
      print,
      printVm,
    );
    _cursor += _handleSubroutineStatements(
      xmls.slice(_cursor),
      indentLevel,
      classSymbolTable,
      subroutineSymbolTable,
      print,
      printVm,
    );
  }

  return _cursor;
};
