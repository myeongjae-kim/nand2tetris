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
  cursor += handleSubroutineBody(xmls.slice(cursor), indentLevel + 1, print);

  print(indentation('</subroutineDec>', indentLevel - 1));

  return cursor;
};

const handleSubroutineBody = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
): number => {
  print(indentation('<subroutineBody>', indentLevel - 1));

  let cursor = 0;
  const subroutineBodyStartSymbolXml = xmls[cursor++];
  print(indentation(subroutineBodyStartSymbolXml, indentLevel));

  const _handleSubroutineStatements = (
    _xmls: string[],
    _indentLevel: number,
    _print: (xml: string) => void,
  ): number => {
    let _cursor = 0;
    const nextXml = _xmls[_cursor];

    if (!nextXml) {
      return _cursor;
    }

    const { value } = parseSingleLineXml(nextXml);

    if (['let', 'if', 'while', 'do', 'return'].includes(value)) {
      _cursor += compileStatements(_xmls.slice(_cursor), _indentLevel + 1, _print);
      _cursor += _handleSubroutineStatements(_xmls.slice(_cursor), _indentLevel, _print);
    }

    return _cursor;
  };

  const _handleSubroutineBody = (
    _xmls: string[],
    _indentLevel: number,
    _print: (xml: string) => void,
  ): number => {
    let _cursor = 0;
    const nextXml = _xmls[_cursor];
    if (!nextXml) {
      return _cursor;
    }

    const { value } = parseSingleLineXml(_xmls[_cursor]);

    if (value === 'var') {
      _cursor += compileVarDec(_xmls.slice(_cursor), _indentLevel + 1, _print);
      _cursor += _handleSubroutineBody(_xmls.slice(_cursor), _indentLevel, _print);
    }

    if (['let', 'if', 'while', 'do', 'return'].includes(value)) {
      print(indentation('<statements>', indentLevel));
      _cursor += _handleSubroutineStatements(_xmls.slice(_cursor), _indentLevel, _print);
      print(indentation('</statements>', indentLevel));
    }

    return _cursor;
  };

  cursor += _handleSubroutineBody(xmls.slice(cursor), indentLevel, print);

  print(indentation(xmls[cursor++], indentLevel));
  print(indentation('</subroutineBody>', indentLevel - 1));

  return cursor;
};
