import { indentation } from '../utils/indentation';
import { parseSingleLineXml } from '../utils/parseSingleLineXml';

export const handleVarDecs = (
  xmls: string[],
  indentLevel: number,
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

  const result = _handleVarDecs(xmls.slice(cursor), indentLevel, print, printVm);

  return {
    cursorProcessed: cursor + result.cursorProcessed,
    totalVarDecs: result.totalVarDecs,
  };
};

const _handleVarDecs = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
  printVm: (vm: string) => void,
): {
  cursorProcessed: number;
  totalVarDecs: number;
} => {
  let _cursor = 0;
  print(indentation(xmls[_cursor++], indentLevel));
  print(indentation(xmls[_cursor++], indentLevel));
  let totalVarDecs = 1;

  if (parseSingleLineXml(xmls[_cursor - 1]).value === ',') {
    const result = _handleVarDecs(xmls.slice(_cursor), indentLevel, print, printVm);
    _cursor += result.cursorProcessed;
    totalVarDecs += result.totalVarDecs;
  }

  return {
    cursorProcessed: _cursor,
    totalVarDecs,
  };
};
