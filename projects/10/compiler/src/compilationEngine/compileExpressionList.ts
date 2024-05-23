import { indentation } from '../utils/indentation';
import { parseSingleLineXml } from '../utils/parseSingleLineXml';
import { compileExpression } from './compileExpression';
import { ClassSymbolTable } from './model/ClassSymbolTable';
import { SubroutineSymbolTable } from './model/SubroutineSymbolTable';

export const compileExpressionList = (
  xmls: string[],
  indentLevel: number,
  classSymbolTable: ClassSymbolTable,
  subroutineSymbolTable: SubroutineSymbolTable,
  print: (xml: string) => void,
  printVm: (vm: string) => void,
): number => {
  let cursor = 0;

  print(indentation('<expressionList>', indentLevel - 1));

  cursor += _handleExpressions(
    xmls,
    indentLevel + 1,
    classSymbolTable,
    subroutineSymbolTable,
    print,
    printVm,
  );

  print(indentation('</expressionList>', indentLevel - 1));

  return cursor;
};

const _handleExpressions = (
  xmls: string[],
  indentLevel: number,
  classSymbolTable: ClassSymbolTable,
  subroutineSymbolTable: SubroutineSymbolTable,
  print: (xml: string) => void,
  printVm: (vm: string) => void,
): number => {
  if (parseSingleLineXml(xmls[0]).value === ')') {
    return 0;
  }

  let _cursor = 0;

  _cursor += compileExpression(
    xmls,
    indentLevel,
    classSymbolTable,
    subroutineSymbolTable,
    print,
    printVm,
  );

  if (parseSingleLineXml(xmls[_cursor]).value === ',') {
    print(indentation(xmls[_cursor++], indentLevel - 1)); // ,
    _cursor += _handleExpressions(
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
