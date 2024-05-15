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

  // indent 붙여서 result에 추가
  print(indentation(keywordXml, indentLevel));
  print(indentation(identifierXml, indentLevel));
  print(indentation(curlyBraceStartXml, indentLevel));

  const _compileClass = (
    _xmls: string[],
    _indentLevel: number,
    _print: (xml: string) => void,
  ): number => {
    let cursor = 0;
    let nextXml = _xmls[cursor];

    if (!nextXml) {
      return cursor;
    }

    const { value } = parseSingleLineXml(nextXml);

    if (['static', 'field'].includes(value)) {
      cursor += compileClassVarDec(_xmls.slice(cursor), _indentLevel + 1, _print);
    }

    if (['constructor', 'function', 'method'].includes(value)) {
      cursor += compileSubroutineDec(_xmls.slice(cursor), _indentLevel + 1, _print);
    }

    nextXml = _xmls[cursor];
    if (!nextXml || parseSingleLineXml(nextXml).value === '}') {
      return cursor;
    }

    const cursorProcessed = _compileClass(_xmls.slice(cursor), _indentLevel, _print);

    return cursor + cursorProcessed;
  };

  cursor += _compileClass(xmls.slice(cursor), indentLevel, print);

  print(indentation(xmls[cursor++], indentLevel)); // }
  print(indentation('</class>', indentLevel - 1));

  return;
};
