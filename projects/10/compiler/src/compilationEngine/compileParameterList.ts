import { indentation } from '../utils/indentation';
import { parseSingleLineXml } from '../utils/parseSingleLineXml';
import { SubroutineSymbolTable } from './model/SubroutineSymbolTable';

export const compileParameterList = (
  xmls: string[],
  indentLevel: number,
  subroutineSymbolTable: SubroutineSymbolTable,
  print: (xml: string) => void,
  printVm: (vm: string) => void,
): number => {
  let cursor = 0;

  print(indentation(xmls[cursor++], indentLevel - 1)); // (
  print(indentation('<parameterList>', indentLevel - 1));

  cursor += _handleParameterList(
    xmls.slice(cursor),
    indentLevel,
    subroutineSymbolTable,
    print,
    printVm,
  );

  print(indentation('</parameterList>', indentLevel - 1));
  print(indentation(xmls[cursor++], indentLevel - 1)); // )

  return cursor;
};

const _handleParameterList = (
  xmls: string[],
  indentLevel: number,
  subroutineSymbolTable: SubroutineSymbolTable,
  print: (xml: string) => void,
  printVm: (vm: string) => void,
): number => {
  let _cursor = 0;

  const { value } = parseSingleLineXml(xmls[_cursor]);

  if (value === ')') {
    return _cursor;
  } else if (value === ',') {
    print(indentation(xmls[_cursor++], indentLevel)); // ,
  }

  const type = parseSingleLineXml(xmls[_cursor]).value;
  print(indentation(xmls[_cursor++], indentLevel)); // type
  const varName = parseSingleLineXml(xmls[_cursor]).value;
  print(indentation(xmls[_cursor++], indentLevel)); // varName

  subroutineSymbolTable.define(varName, type, 'arg');

  _cursor += _handleParameterList(
    xmls.slice(_cursor),
    indentLevel,
    subroutineSymbolTable,
    print,
    printVm,
  );

  return _cursor;
};
