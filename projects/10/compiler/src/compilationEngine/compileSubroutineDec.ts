import { CompileResult } from './CompileResult';
import { indentation } from '../utils/indentation';
import { parseSingleLineXml } from '../utils/parseSingleLineXml';
import { compileStatements } from './compileStatements';
import { compileVarDec } from './compileVarDec';
import { compileParameterList } from './compileParameterList';

export const compileSubroutineDec = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
): CompileResult => {
  print(indentation('<subroutineDec>', indentLevel - 1));

  let cursor = 0;
  const keywordXml = xmls[cursor++];
  const typeXml = xmls[cursor++];
  const subroutineNameXml = xmls[cursor++];

  print(indentation(keywordXml, indentLevel));
  print(indentation(typeXml, indentLevel));
  print(indentation(subroutineNameXml, indentLevel));

  cursor += compileParameterList(xmls.slice(cursor), indentLevel + 1, print).cursorProcessed;
  cursor += handleSubroutineBody(xmls.slice(cursor), indentLevel + 1, print).cursorProcessed;

  print(indentation('</subroutineDec>', indentLevel - 1));

  return { cursorProcessed: cursor };
};

const handleSubroutineBody = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
): CompileResult => {
  print(indentation('<subroutineBody>', indentLevel - 1));

  let cursor = 0;
  const subroutineBodyStartSymbolXml = xmls[cursor++];
  print(indentation(subroutineBodyStartSymbolXml, indentLevel));

  const _handleSubroutineStatements = (
    _xmls: string[],
    _indentLevel: number,
    _print: (xml: string) => void,
  ): CompileResult => {
    let _cursor = 0;
    const nextXml = _xmls[_cursor];

    if (!nextXml) {
      return { cursorProcessed: _cursor };
    }

    const { value } = parseSingleLineXml(nextXml);

    if (['let', 'if', 'while', 'do', 'return'].includes(value)) {
      _cursor += compileStatements(_xmls.slice(_cursor), _indentLevel + 1, _print).cursorProcessed;
      _cursor += _handleSubroutineStatements(
        _xmls.slice(_cursor),
        _indentLevel,
        _print,
      ).cursorProcessed;
    }

    return {
      cursorProcessed: _cursor,
    };
  };

  const _handleSubroutineBody = (
    _xmls: string[],
    _indentLevel: number,
    _print: (xml: string) => void,
  ): CompileResult => {
    let _cursor = 0;
    const nextXml = _xmls[_cursor];
    if (!nextXml) {
      return { cursorProcessed: _cursor };
    }

    const { value } = parseSingleLineXml(_xmls[_cursor]);

    if (value === 'var') {
      _cursor += compileVarDec(_xmls.slice(_cursor), _indentLevel + 1, _print).cursorProcessed;
      _cursor += _handleSubroutineBody(_xmls.slice(_cursor), _indentLevel, _print).cursorProcessed;
    }

    if (['let', 'if', 'while', 'do', 'return'].includes(value)) {
      print(indentation('<statements>', indentLevel));
      _cursor += _handleSubroutineStatements(
        _xmls.slice(_cursor),
        _indentLevel,
        _print,
      ).cursorProcessed;
      print(indentation('</statements>', indentLevel));
    }

    return {
      cursorProcessed: _cursor,
    };
  };

  cursor += _handleSubroutineBody(xmls.slice(cursor), indentLevel, print).cursorProcessed;

  print(indentation(xmls[cursor++], indentLevel));
  print(indentation('</subroutineBody>', indentLevel - 1));

  return {
    cursorProcessed: cursor,
  };
};
