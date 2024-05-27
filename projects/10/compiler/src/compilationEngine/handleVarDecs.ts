import { indentation } from '../utils/indentation';
import { parseSingleLineXml } from '../utils/parseSingleLineXml';
import { SymbolKind, SymbolTable } from './model/SymbolTable';

export const handleVarDecs = (
  xmls: string[],
  indentLevel: number,
  symbolTable: SymbolTable,
  symbolKind: SymbolKind,
  print: (xml: string) => void,
  printVm: (vm: string) => void,
): {
  cursorProcessed: number;
  totalVarDecs: number;
} => {
  let cursor = 0;
  const staticOrFieldXml = xmls[cursor++];
  const typeXml = xmls[cursor++];

  print(indentation(staticOrFieldXml, indentLevel));
  print(indentation(typeXml, indentLevel));

  const type = parseSingleLineXml(typeXml).value;
  const result = _handleVarDecs(
    xmls.slice(cursor),
    indentLevel,
    type,
    symbolTable,
    symbolKind,
    print,
    printVm,
  );

  return {
    cursorProcessed: cursor + result.cursorProcessed,
    totalVarDecs: result.totalVarDecs,
  };
};

const _handleVarDecs = (
  xmls: string[],
  indentLevel: number,
  type: string,
  symbolTable: SymbolTable,
  symbolKind: SymbolKind,
  print: (xml: string) => void,
  printVm: (vm: string) => void,
): {
  cursorProcessed: number;
  totalVarDecs: number;
} => {
  let _cursor = 0;
  const varName = parseSingleLineXml(xmls[_cursor]).value;
  print(indentation(xmls[_cursor++], indentLevel));
  symbolTable.define(varName, type, symbolKind);
  print(indentation(xmls[_cursor++], indentLevel));
  let totalVarDecs = 1;

  if (parseSingleLineXml(xmls[_cursor - 1]).value === ',') {
    const result = _handleVarDecs(
      xmls.slice(_cursor),
      indentLevel,
      type,
      symbolTable,
      symbolKind,
      print,
      printVm,
    );
    _cursor += result.cursorProcessed;
    totalVarDecs += result.totalVarDecs;
  }

  return {
    cursorProcessed: _cursor,
    totalVarDecs,
  };
};
