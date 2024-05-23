import { indentation } from '../utils/indentation';
import { parseSingleLineXml } from '../utils/parseSingleLineXml';
import { compileStatements } from './compileStatements';
import { compileVarDec } from './compileVarDec';
import { compileParameterList } from './compileParameterList';
import { ClassSymbolTable } from './model/ClassSymbolTable';
import { SubroutineSymbolTable } from './model/SubroutineSymbolTable';
import { vmWriter } from './model/VmWriter';

export const compileSubroutineDec = (
  xmls: string[],
  indentLevel: number,
  classSymbolTable: ClassSymbolTable,
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

  // TODO: parameter 개수 세기
  cursor += compileParameterList(xmls.slice(cursor), indentLevel + 1, print, printVm);

  printVm(
    vmWriter.writeFunction(
      classSymbolTable.className,
      subroutineSymbolTable.subroutineName,
      0, // TODO: 하드코딩된 매개변수 개수 변경
    ),
  );

  cursor += _compileSubroutineBody(
    xmls.slice(cursor),
    indentLevel + 1,
    classSymbolTable,
    subroutineSymbolTable,
    print,
    printVm,
  );

  print(indentation('</subroutineDec>', indentLevel - 1));

  if (parseSingleLineXml(typeXml).value === 'void') {
    printVm(vmWriter.writePush('constant', 0));
    printVm(vmWriter.writeReturn());
  }

  return cursor;
};

const _compileSubroutineBody = (
  xmls: string[],
  indentLevel: number,
  classSymbolTable: ClassSymbolTable,
  subroutineSymbolTable: SubroutineSymbolTable,
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
  print: (xml: string) => void,
  printVm: (vm: string) => void,
): number => {
  let _cursor = 0;
  const nextXml = xmls[_cursor];
  if (!nextXml) {
    return _cursor;
  }

  const { value } = parseSingleLineXml(xmls[_cursor]);

  if (value === 'var') {
    _cursor += compileVarDec(xmls.slice(_cursor), indentLevel + 1, print, printVm);
    _cursor += _handleSubroutineBody(
      xmls.slice(_cursor),
      indentLevel,
      classSymbolTable,
      subroutineSymbolTable,
      print,
      printVm,
    );
  }

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
