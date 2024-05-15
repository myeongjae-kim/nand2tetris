import { indentation } from '../utils/indentation';
import { parseSingleLineXml } from '../utils/parseSingleLineXml';
import { compileClassVarDec } from './compileClassVarDec';
import { compileSubroutineDec } from './compileSubroutineDec';

export const compileClass = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
): void => {
  if (xmls.length === 0) {
    throw Error('Invalid XML.');
  }
  print(indentation('<class>', indentLevel - 1));

  let cursor = 0;
  const keywordXml = xmls[cursor++];
  const identifierXml = xmls[cursor++];
  const curlyBraceStartXml = xmls[cursor++];

  print(indentation(keywordXml, indentLevel));
  print(indentation(identifierXml, indentLevel));
  print(indentation(curlyBraceStartXml, indentLevel));

  cursor += _compileClass(xmls.slice(cursor), indentLevel, print);

  print(indentation(xmls[cursor++], indentLevel)); // }
  print(indentation('</class>', indentLevel - 1));

  return;
};

const _compileClass = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
): number => {
  let cursor = 0;
  let nextXml = xmls[cursor];

  if (!nextXml) {
    return cursor;
  }

  const { value } = parseSingleLineXml(nextXml);

  if (['static', 'field'].includes(value)) {
    cursor += compileClassVarDec(xmls.slice(cursor), indentLevel + 1, print);
  }

  if (['constructor', 'function', 'method'].includes(value)) {
    cursor += compileSubroutineDec(xmls.slice(cursor), indentLevel + 1, print);
  }

  nextXml = xmls[cursor];
  if (!nextXml || parseSingleLineXml(nextXml).value === '}') {
    return cursor;
  }

  const cursorProcessed = _compileClass(xmls.slice(cursor), indentLevel, print);

  return cursor + cursorProcessed;
};
