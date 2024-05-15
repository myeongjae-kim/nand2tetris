import { writeFilePromise } from './writeFilePromise';
import { readFilePromise } from './readFilePromise';

export const compilationEngine = async (...tokenXmlPaths: string[]): Promise<void> => {
  await Promise.all(
    tokenXmlPaths.map(async (tokenXmlPath) => {
      if (!tokenXmlPath.endsWith('T.xml')) {
        return;
      }

      let xml = '';
      const print = (_xml: string) => {
        xml += _xml + '\n';
      };

      compile((await readFilePromise(tokenXmlPath)).split('\n'), 0, print);

      await writeFilePromise(tokenXmlPath.replace('T.xml', '.xml'), xml.trim());
    }),
  );
};

type SingleLineXml = {
  tag: string;
  value: string;
};

type CompileResult = {
  cursorProcessed: number;
};

const operators = ['+', '-', '~', '*', '/', '&amp;', '|', '&lt;', '&gt;', '='];

const parseSingleLineXml = (xml: string): SingleLineXml => {
  const tagStart = xml.indexOf('<');
  const tagEnd = xml.indexOf('>');
  if (tagStart === -1 || tagEnd === -1) {
    throw Error('Invalid XML.');
  }

  const tag = xml.slice(tagStart + 1, tagEnd);

  const closeTatStart = xml.indexOf('</');

  const value = xml.slice(tagEnd + 1, closeTatStart).trim();

  return { tag, value };
};

const indentation = (xml: string, indentLevel: number) => ' '.repeat(indentLevel * 2) + xml;

const compile = (xmls: string[], indentLevel: number, print: (xml: string) => void): void => {
  if (xmls.length === 0) {
    return;
  }

  const firstLine = parseSingleLineXml(xmls[0]);
  if (firstLine.tag === 'tokens') {
    return compile(xmls.slice(1, -1), indentLevel, print);
  }

  if (firstLine.tag === 'keyword') {
    if (firstLine.value === 'class') {
      return compileClass(xmls, indentLevel + 1, print);
    }
  }

  return;
};

const compileClass = (xmls: string[], indentLevel: number, print: (xml: string) => void): void => {
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
  ): CompileResult => {
    let cursor = 0;
    let nextXml = _xmls[cursor];

    if (!nextXml) {
      return { cursorProcessed: cursor };
    }

    const { value } = parseSingleLineXml(nextXml);

    if (['static', 'field'].includes(value)) {
      cursor += compileClassVarDec(_xmls.slice(cursor), _indentLevel + 1, _print).cursorProcessed;
    }

    if (['constructor', 'function', 'method'].includes(value)) {
      cursor += compileSubroutineDec(_xmls.slice(cursor), _indentLevel + 1, _print).cursorProcessed;
    }

    nextXml = _xmls[cursor];
    if (!nextXml || parseSingleLineXml(nextXml).value === '}') {
      return { cursorProcessed: cursor };
    }

    const { cursorProcessed } = _compileClass(_xmls.slice(cursor), _indentLevel, _print);

    return {
      cursorProcessed: cursor + cursorProcessed,
    };
  };

  cursor += _compileClass(xmls.slice(cursor), indentLevel, print).cursorProcessed;

  print(indentation(xmls[cursor++], indentLevel)); // }
  print(indentation('</class>', indentLevel - 1));

  return;
};

const handleVarDecs = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
): CompileResult => {
  let cursor = 0;
  const staticOrFieldXml = xmls[cursor++];
  const typeXml = xmls[cursor++];

  print(indentation(staticOrFieldXml, indentLevel));
  print(indentation(typeXml, indentLevel));

  const _handleVarDecs = (
    _xmls: string[],
    _indentLevel: number,
    _print: (xml: string) => void,
  ): CompileResult => {
    let _cursor = 0;
    print(indentation(_xmls[_cursor++], indentLevel));
    print(indentation(_xmls[_cursor++], indentLevel));

    if (parseSingleLineXml(_xmls[_cursor - 1]).value === ',') {
      _cursor += _handleVarDecs(_xmls.slice(_cursor), _indentLevel, _print).cursorProcessed;
    }

    return {
      cursorProcessed: _cursor,
    };
  };

  cursor += _handleVarDecs(xmls.slice(cursor), indentLevel, print).cursorProcessed;

  return {
    cursorProcessed: cursor,
  };
};

const compileClassVarDec = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
): CompileResult => {
  print(indentation('<classVarDec>', indentLevel - 1));
  const { cursorProcessed } = handleVarDecs(xmls, indentLevel, print);
  print(indentation('</classVarDec>', indentLevel - 1));

  return { cursorProcessed };
};

const handleParameterList = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
): {
  cursorProcessed: number;
} => {
  let cursor = 0;

  print(indentation(xmls[cursor++], indentLevel - 1)); // (
  print(indentation('<parameterList>', indentLevel - 1));

  const _handleParameterList = (
    _xmls: string[],
    _indentLevel: number,
    _print: (xml: string) => void,
  ): CompileResult => {
    let _cursor = 0;

    const { value } = parseSingleLineXml(_xmls[_cursor]);

    if (value === ')') {
      return { cursorProcessed: _cursor };
    } else if (value === ',') {
      _print(indentation(_xmls[_cursor++], _indentLevel)); // ,
    }

    _print(indentation(_xmls[_cursor++], _indentLevel)); // type
    _print(indentation(_xmls[_cursor++], _indentLevel)); // varName
    _cursor += _handleParameterList(_xmls.slice(_cursor), _indentLevel, _print).cursorProcessed;

    return {
      cursorProcessed: _cursor,
    };
  };

  cursor += _handleParameterList(xmls.slice(cursor), indentLevel, print).cursorProcessed;

  print(indentation('</parameterList>', indentLevel - 1));
  print(indentation(xmls[cursor++], indentLevel - 1)); // )

  return {
    cursorProcessed: cursor,
  };
};

const compileVarDec = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
): CompileResult => {
  print(indentation('<varDec>', indentLevel - 1));
  const { cursorProcessed } = handleVarDecs(xmls, indentLevel, print);
  print(indentation('</varDec>', indentLevel - 1));

  return { cursorProcessed };
};

const compileExpression = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
): CompileResult => {
  print(indentation('<expression>', indentLevel - 1));

  const _handleTerm = (
    _xmls: string[],
    _indentLevel: number,
    _print: (xml: string) => void,
  ): CompileResult => {
    _print(indentation('<term>', _indentLevel - 1));

    let _cursor = 0;
    if (!_xmls[_cursor]) {
      return { cursorProcessed: _cursor };
    }
    const { tag } = parseSingleLineXml(_xmls[_cursor]);

    switch (tag) {
      case 'symbol': {
        const { value: _value } = parseSingleLineXml(_xmls[_cursor]);
        if (_value === '(') {
          _print(indentation(_xmls[_cursor++], _indentLevel)); // (
          _cursor += compileExpression(
            _xmls.slice(_cursor),
            _indentLevel + 1,
            _print,
          ).cursorProcessed;

          if (parseSingleLineXml(_xmls[_cursor]).tag === 'symbol') {
            if (parseSingleLineXml(_xmls[_cursor]).value === ')') {
              _print(indentation(_xmls[_cursor++], _indentLevel)); // )
            }
          }
        } else if (operators.includes(_value)) {
          _print(indentation(_xmls[_cursor++], _indentLevel));
          _cursor += _handleTerm(_xmls.slice(_cursor), _indentLevel + 1, _print).cursorProcessed;
        }

        break;
      }
      case 'integerConstant':
      case 'stringConstant':
      case 'keyword':
      case 'identifier': {
        _print(indentation(_xmls[_cursor++], _indentLevel));

        if (parseSingleLineXml(_xmls[_cursor]).value === '.') {
          _print(indentation(_xmls[_cursor++], _indentLevel));
          _print(indentation(_xmls[_cursor++], _indentLevel));
        }

        if (parseSingleLineXml(_xmls[_cursor]).value === '(') {
          _print(indentation(_xmls[_cursor++], _indentLevel)); // (
          _cursor += compileExpressionList(
            _xmls.slice(_cursor),
            _indentLevel + 1,
            _print,
          ).cursorProcessed;

          _print(indentation(_xmls[_cursor++], _indentLevel)); // )
        }

        if (parseSingleLineXml(_xmls[_cursor]).value === '[') {
          _print(indentation(_xmls[_cursor++], _indentLevel)); // [

          _cursor += compileExpression(
            _xmls.slice(_cursor),
            _indentLevel + 1,
            _print,
          ).cursorProcessed;

          _print(indentation(_xmls[_cursor++], _indentLevel)); // ]
        }
        break;
      }
      default:
        throw new Error('compileExpression cannot handle current line: ' + _xmls[_cursor]);
    }
    _print(indentation('</term>', _indentLevel - 1));

    if (operators.includes(parseSingleLineXml(_xmls[_cursor]).value)) {
      _print(indentation(_xmls[_cursor++], _indentLevel - 1)); // print operator
      _cursor += _handleTerm(_xmls.slice(_cursor), _indentLevel, _print).cursorProcessed;
    }

    return { cursorProcessed: _cursor };
  };

  const { cursorProcessed } = _handleTerm(xmls, indentLevel + 1, print);

  print(indentation('</expression>', indentLevel - 1));

  return { cursorProcessed };
};

const compileExpressionList = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
): CompileResult => {
  let cursor = 0;

  const _handleExpressions = (
    _xmls: string[],
    _indentLevel: number,
    _print: (xml: string) => void,
  ): CompileResult => {
    if (parseSingleLineXml(_xmls[0]).value === ')') {
      return { cursorProcessed: 0 };
    }

    let _cursor = 0;

    _cursor += compileExpression(_xmls, _indentLevel, _print).cursorProcessed;

    if (parseSingleLineXml(_xmls[_cursor]).value === ',') {
      _print(indentation(_xmls[_cursor++], _indentLevel - 1)); // ,
      _cursor += _handleExpressions(_xmls.slice(_cursor), _indentLevel, _print).cursorProcessed;
    }

    return {
      cursorProcessed: _cursor,
    };
  };

  print(indentation('<expressionList>', indentLevel - 1));

  cursor += _handleExpressions(xmls, indentLevel + 1, print).cursorProcessed;

  print(indentation('</expressionList>', indentLevel - 1));

  return {
    cursorProcessed: cursor,
  };
};

const compileStatements = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
): CompileResult => {
  const _handleStatements = (
    _xmls: string[],
    _indentLevel: number,
    _print: (xml: string) => void,
  ): CompileResult => {
    let _cursor = 0;
    const nextXml = _xmls[_cursor++];
    if (!nextXml) {
      return { cursorProcessed: _cursor };
    }

    const { tag, value } = parseSingleLineXml(nextXml);
    if (tag !== 'keyword') {
      return { cursorProcessed: _cursor - 1 };
    }

    switch (value) {
      case 'let': {
        _print(indentation('<letStatement>', _indentLevel - 1));
        _print(indentation(nextXml, _indentLevel));
        _print(indentation(_xmls[_cursor++], _indentLevel));
        if (parseSingleLineXml(_xmls[_cursor]).value === '[') {
          _print(indentation(_xmls[_cursor++], _indentLevel)); // [
          _cursor += compileExpression(
            _xmls.slice(_cursor),
            _indentLevel + 1,
            _print,
          ).cursorProcessed;
          _print(indentation(_xmls[_cursor++], _indentLevel)); // ]
        }
        _print(indentation(_xmls[_cursor++], _indentLevel)); // =
        _cursor += compileExpression(
          _xmls.slice(_cursor),
          _indentLevel + 1,
          _print,
        ).cursorProcessed;
        _print(indentation(_xmls[_cursor++], _indentLevel));

        _print(indentation('</letStatement>', _indentLevel - 1));

        break;
      }
      case 'if': {
        _print(indentation('<ifStatement>', _indentLevel - 1));

        _print(indentation(nextXml, _indentLevel)); // if
        _print(indentation(_xmls[_cursor++], _indentLevel)); // (
        _cursor += compileExpression(
          _xmls.slice(_cursor),
          _indentLevel + 1,
          _print,
        ).cursorProcessed;
        _print(indentation(_xmls[_cursor++], _indentLevel)); // )

        _print(indentation(_xmls[_cursor++], _indentLevel));
        _print(indentation('<statements>', _indentLevel));
        _cursor += compileStatements(
          _xmls.slice(_cursor),
          _indentLevel + 1,
          _print,
        ).cursorProcessed;
        _print(indentation('</statements>', _indentLevel));
        _print(indentation(_xmls[_cursor++], _indentLevel));

        if (parseSingleLineXml(_xmls[_cursor]).value === 'else') {
          _print(indentation(_xmls[_cursor++], _indentLevel)); // else
          _print(indentation(_xmls[_cursor++], _indentLevel)); // {
          _print(indentation('<statements>', _indentLevel));
          _cursor += compileStatements(
            _xmls.slice(_cursor),
            _indentLevel + 1,
            _print,
          ).cursorProcessed;
          _print(indentation('</statements>', _indentLevel));
          _print(indentation(_xmls[_cursor++], _indentLevel)); // }
        }

        _print(indentation('</ifStatement>', _indentLevel - 1));

        break;
      }
      case 'while': {
        _print(indentation('<whileStatement>', _indentLevel - 1));

        _print(indentation(nextXml, _indentLevel)); // while
        _print(indentation(_xmls[_cursor++], _indentLevel)); // (
        _cursor += compileExpression(
          _xmls.slice(_cursor),
          _indentLevel + 1,
          _print,
        ).cursorProcessed;
        _print(indentation(_xmls[_cursor++], _indentLevel)); // )

        _print(indentation(_xmls[_cursor++], _indentLevel));
        _print(indentation('<statements>', _indentLevel));
        _cursor += compileStatements(
          _xmls.slice(_cursor),
          _indentLevel + 1,
          _print,
        ).cursorProcessed;
        _print(indentation('</statements>', _indentLevel));
        _print(indentation(_xmls[_cursor++], _indentLevel));

        _print(indentation('</whileStatement>', _indentLevel - 1));

        break;
      }
      case 'do': {
        _print(indentation('<doStatement>', _indentLevel - 1));
        _print(indentation(nextXml, _indentLevel));
        _print(indentation(_xmls[_cursor++], _indentLevel));

        if (parseSingleLineXml(_xmls[_cursor]).value === '.') {
          _print(indentation(_xmls[_cursor++], _indentLevel));
          _print(indentation(_xmls[_cursor++], _indentLevel));
        }

        _print(indentation(_xmls[_cursor++], _indentLevel)); // parenthesis open
        _cursor += compileExpressionList(
          _xmls.slice(_cursor),
          _indentLevel + 1,
          _print,
        ).cursorProcessed;
        _print(indentation(_xmls[_cursor++], _indentLevel)); // parenthesis close
        _print(indentation(_xmls[_cursor++], _indentLevel)); // semicolon

        _print(indentation('</doStatement>', _indentLevel - 1));

        break;
      }
      case 'return': {
        _print(indentation('<returnStatement>', _indentLevel - 1));

        _print(indentation(nextXml, _indentLevel)); // return

        if (parseSingleLineXml(_xmls[_cursor]).value !== ';') {
          _cursor += compileExpression(
            _xmls.slice(_cursor),
            _indentLevel + 1,
            _print,
          ).cursorProcessed;
        }

        _print(indentation(_xmls[_cursor++], _indentLevel)); // semicolon

        _print(indentation('</returnStatement>', _indentLevel - 1));

        break;
      }
      default:
        throw new Error('Invalid XML.');
    }

    return {
      cursorProcessed:
        _cursor + _handleStatements(_xmls.slice(_cursor), _indentLevel, _print).cursorProcessed,
    };
  };

  const { cursorProcessed } = _handleStatements(xmls, indentLevel + 1, print);

  return { cursorProcessed };
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

  // TODO: print subroutineBodyEndSymbolXml
  print(indentation(xmls[cursor++], indentLevel));
  print(indentation('</subroutineBody>', indentLevel - 1));

  return {
    cursorProcessed: cursor,
  };
};

const compileSubroutineDec = (
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

  cursor += handleParameterList(xmls.slice(cursor), indentLevel + 1, print).cursorProcessed;
  cursor += handleSubroutineBody(xmls.slice(cursor), indentLevel + 1, print).cursorProcessed;

  print(indentation('</subroutineDec>', indentLevel - 1));

  return { cursorProcessed: cursor };
};
