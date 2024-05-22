import { indentation } from '../utils/indentation';
import { parseSingleLineXml } from '../utils/parseSingleLineXml';

export const handleVarDecs = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
  printVm: (vm: string) => void,
): number => {
  let cursor = 0;
  const staticOrFieldXml = xmls[cursor++];
  const typeXml = xmls[cursor++];

  print(indentation(staticOrFieldXml, indentLevel));
  print(indentation(typeXml, indentLevel));

  cursor += _handleVarDecs(xmls.slice(cursor), indentLevel, print, printVm);

  return cursor;
};

const _handleVarDecs = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
  printVm: (vm: string) => void,
): number => {
  let _cursor = 0;
  print(indentation(xmls[_cursor++], indentLevel));
  print(indentation(xmls[_cursor++], indentLevel));

  if (parseSingleLineXml(xmls[_cursor - 1]).value === ',') {
    _cursor += _handleVarDecs(xmls.slice(_cursor), indentLevel, print, printVm);
  }

  return _cursor;
};
