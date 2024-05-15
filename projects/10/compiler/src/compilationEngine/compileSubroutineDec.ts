import { indentation } from '../utils/indentation';
import { parseSingleLineXml } from '../utils/parseSingleLineXml';
import { compileStatements } from './compileStatements';
import { compileVarDec } from './compileVarDec';
import { compileParameterList } from './compileParameterList';

export const compileSubroutineDec = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
): number => {
  print(indentation('<subroutineDec>', indentLevel - 1));

  let cursor = 0;
  const keywordXml = xmls[cursor++];
  const typeXml = xmls[cursor++];
  const subroutineNameXml = xmls[cursor++];

  print(indentation(keywordXml, indentLevel));
  print(indentation(typeXml, indentLevel));
  print(indentation(subroutineNameXml, indentLevel));

  cursor += compileParameterList(xmls.slice(cursor), indentLevel + 1, print);
  cursor += _compileSubroutineBody(xmls.slice(cursor), indentLevel + 1, print);

  print(indentation('</subroutineDec>', indentLevel - 1));

  return cursor;
};

const _compileSubroutineBody = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
): number => {
  print(indentation('<subroutineBody>', indentLevel - 1));

  let cursor = 0;
  const subroutineBodyStartSymbolXml = xmls[cursor++];
  print(indentation(subroutineBodyStartSymbolXml, indentLevel));

  cursor += _handleSubroutineBody(xmls.slice(cursor), indentLevel, print);

  print(indentation(xmls[cursor++], indentLevel));
  print(indentation('</subroutineBody>', indentLevel - 1));

  return cursor;
};

const _handleSubroutineBody = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
): number => {
  let _cursor = 0;
  const nextXml = xmls[_cursor];
  if (!nextXml) {
    return _cursor;
  }

  const { value } = parseSingleLineXml(xmls[_cursor]);

  if (value === 'var') {
    _cursor += compileVarDec(xmls.slice(_cursor), indentLevel + 1, print);
    _cursor += _handleSubroutineBody(xmls.slice(_cursor), indentLevel, print);
  }

  if (['let', 'if', 'while', 'do', 'return'].includes(value)) {
    print(indentation('<statements>', indentLevel));
    _cursor += _handleSubroutineStatements(xmls.slice(_cursor), indentLevel, print);
    print(indentation('</statements>', indentLevel));
  }

  return _cursor;
};

const _handleSubroutineStatements = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
): number => {
  let _cursor = 0;
  const nextXml = xmls[_cursor];

  if (!nextXml) {
    return _cursor;
  }

  const { value } = parseSingleLineXml(nextXml);

  if (['let', 'if', 'while', 'do', 'return'].includes(value)) {
    _cursor += compileStatements(xmls.slice(_cursor), indentLevel + 1, print);
    _cursor += _handleSubroutineStatements(xmls.slice(_cursor), indentLevel, print);
  }

  return _cursor;
};
