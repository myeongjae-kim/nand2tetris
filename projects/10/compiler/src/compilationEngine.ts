import { writeFilePromise } from './writeFilePromise';
import { readFilePromise } from './readFilePromise';

export const compilationEngine = async (...tokenXmlPaths: string[]): Promise<void> => {
  await Promise.all(
    tokenXmlPaths.map(async (tokenXmlPath) => {
      if (!tokenXmlPath.endsWith('T.xml')) {
        return;
      }
      const xml = compile((await readFilePromise(tokenXmlPath)).split('\n')).join('\n');

      await writeFilePromise(tokenXmlPath.replace('T.xml', '.xml'), xml);
    }),
  );
};

type SingleLineXml = {
  tag: string;
  value: string;
};

type CompileResult = {
  cursorProcessed: number;
  result: string[];
};

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

const compile = (xmls: string[], indentLevel = 0, result = []): string[] => {
  if (xmls.length === 0) {
    return result;
  }

  const firstLine = parseSingleLineXml(xmls[0]);
  if (firstLine.tag === 'tokens') {
    return compile(xmls.slice(1, -1), indentLevel, result);
  }

  if (firstLine.tag === 'keyword') {
    if (firstLine.value === 'class') {
      return compileClass(xmls, indentLevel + 1, result);
    }
  }

  return result;
};

const compileClass = (xmls: string[], indentLevel: number, result: string[]): string[] => {
  if (xmls.length === 0) {
    throw Error('Invalid XML.');
  }
  result.push(indentation('<class>', indentLevel - 1));

  let cursor = 0;
  const keywordXml = xmls[cursor++];
  const identifierXml = xmls[cursor++];
  const curlyBraceStartXml = xmls[cursor++];

  // indent 붙여서 result에 추가
  result.push(indentation(keywordXml, indentLevel));
  result.push(indentation(identifierXml, indentLevel));
  result.push(indentation(curlyBraceStartXml, indentLevel));

  const _compileClass = (
    _xmls: string[],
    _indentLevel: number,
    _result: string[],
  ): CompileResult => {
    let cursor = 0;
    let nextXml = _xmls[cursor];

    if (!nextXml) {
      return { cursorProcessed: cursor, result: _result };
    }

    const { value } = parseSingleLineXml(nextXml);

    if (['static', 'field'].includes(value)) {
      cursor += compileClassVarDec(_xmls.slice(cursor), _indentLevel + 1, _result).cursorProcessed;
    }

    if (['constructor', 'function', 'method'].includes(value)) {
      cursor += compileSubroutineDec(
        _xmls.slice(cursor),
        _indentLevel + 1,
        _result,
      ).cursorProcessed;
    }

    nextXml = _xmls[cursor];
    if (!nextXml || parseSingleLineXml(nextXml).value === '}') {
      return { cursorProcessed: cursor, result: _result };
    }

    const { cursorProcessed, result: resultToReturn } = _compileClass(
      _xmls.slice(cursor),
      _indentLevel,
      _result,
    );

    return {
      cursorProcessed: cursor + cursorProcessed,
      result: resultToReturn,
    };
  };

  cursor += _compileClass(xmls.slice(cursor), indentLevel, result).cursorProcessed;

  result.push(indentation(xmls[cursor++], indentLevel)); // }
  result.push(indentation('</class>', indentLevel - 1));

  return result;
};

const handleVarDecs = (xmls: string[], indentLevel: number, result: string[]): CompileResult => {
  let cursor = 0;
  const staticOrFieldXml = xmls[cursor++];
  const typeXml = xmls[cursor++];

  result.push(indentation(staticOrFieldXml, indentLevel));
  result.push(indentation(typeXml, indentLevel));

  const _handleVarDecs = (
    _xmls: string[],
    _indentLevel: number,
    _result: string[],
  ): CompileResult => {
    let _cursor = 0;
    result.push(indentation(_xmls[_cursor++], indentLevel));
    result.push(indentation(_xmls[_cursor++], indentLevel));

    if (parseSingleLineXml(_xmls[_cursor - 1]).value === ',') {
      _cursor += _handleVarDecs(_xmls.slice(_cursor), _indentLevel, _result).cursorProcessed;
    }

    return {
      cursorProcessed: _cursor,
      result: _result,
    };
  };

  cursor += _handleVarDecs(xmls.slice(cursor), indentLevel, result).cursorProcessed;

  return {
    cursorProcessed: cursor,
    result,
  };
};

const compileClassVarDec = (
  xmls: string[],
  indentLevel: number,
  result: string[],
): CompileResult => {
  result.push(indentation('<classVarDec>', indentLevel - 1));
  const { cursorProcessed } = handleVarDecs(xmls, indentLevel, result);
  result.push(indentation('</classVarDec>', indentLevel - 1));

  return { cursorProcessed, result };
};

const handleParameterList = (
  xmls: string[],
  indentLevel: number,
  result: string[],
): {
  cursorProcessed: number;
  result: string[];
} => {
  let cursor = 0;

  result.push(indentation(xmls[cursor++], indentLevel - 1)); // (
  result.push(indentation('<parameterList>', indentLevel - 1));

  const _handleParameterList = (
    _xmls: string[],
    _indentLevel: number,
    _result: string[],
  ): CompileResult => {
    let _cursor = 0;

    const { value } = parseSingleLineXml(_xmls[_cursor]);

    if (value === ')') {
      return { cursorProcessed: _cursor, result: _result };
    } else if (value === ',') {
      _result.push(indentation(_xmls[_cursor++], _indentLevel)); // ,
    }

    _result.push(indentation(_xmls[_cursor++], _indentLevel)); // type
    _result.push(indentation(_xmls[_cursor++], _indentLevel)); // varName
    _cursor += _handleParameterList(_xmls.slice(_cursor), _indentLevel, _result).cursorProcessed;

    return {
      cursorProcessed: _cursor,
      result: _result,
    };
  };

  cursor += _handleParameterList(xmls.slice(cursor), indentLevel, result).cursorProcessed;

  result.push(indentation('</parameterList>', indentLevel - 1));
  result.push(indentation(xmls[cursor++], indentLevel - 1)); // )

  return {
    cursorProcessed: cursor,
    result,
  };
};

const compileVarDec = (xmls: string[], indentLevel: number, result: string[]): CompileResult => {
  result.push(indentation('<varDec>', indentLevel - 1));
  const { cursorProcessed } = handleVarDecs(xmls, indentLevel, result);
  result.push(indentation('</varDec>', indentLevel - 1));

  return { cursorProcessed, result };
};

const compileExpression = (
  xmls: string[],
  indentLevel: number,
  result: string[],
): CompileResult => {
  result.push(indentation('<expression>', indentLevel - 1));

  const _handleTerm = (_xmls: string[], _indentLevel: number, _result: string[]): CompileResult => {
    let cursor = 0;
    if (!_xmls[cursor]) {
      return { cursorProcessed: cursor, result: _result };
    }
    const { tag } = parseSingleLineXml(_xmls[cursor]);

    const implementedTags = [
      'integerConstant',
      'stringConstant',
      'keyword',
      'symbol',
      'identifier',
    ];
    if (!implementedTags.includes(tag)) {
      throw new Error('compileExpression cannot handle current line: ' + _xmls[cursor]);
    }

    _result.push(indentation('<term>', _indentLevel - 1));
    _result.push(indentation(_xmls[cursor++], _indentLevel));
    _result.push(indentation('</term>', _indentLevel - 1));

    return { cursorProcessed: cursor, result: _result };
  };

  const { cursorProcessed } = _handleTerm(xmls, indentLevel + 1, result);

  result.push(indentation('</expression>', indentLevel - 1));

  return { cursorProcessed, result };
};

const compileExpressionList = (
  xmls: string[],
  indentLevel: number,
  result: string[],
): CompileResult => {
  let cursor = 0;

  const _handleExpressions = (
    _xmls: string[],
    _indentLevel: number,
    _result: string[],
  ): CompileResult => {
    if (parseSingleLineXml(_xmls[0]).value === ')') {
      return { cursorProcessed: 0, result: _result };
    }

    let _cursor = 0;

    _cursor += compileExpression(_xmls, _indentLevel, _result).cursorProcessed;

    if (parseSingleLineXml(_xmls[_cursor]).value === ',') {
      _result.push(indentation(_xmls[_cursor++], _indentLevel - 1)); // ,
      _cursor += _handleExpressions(_xmls.slice(_cursor), _indentLevel, _result).cursorProcessed;
    }

    return {
      cursorProcessed: _cursor,
      result: _result,
    };
  };

  result.push(indentation('<expressionList>', indentLevel - 1));

  cursor += _handleExpressions(xmls, indentLevel + 1, result).cursorProcessed;

  result.push(indentation('</expressionList>', indentLevel - 1));

  return {
    cursorProcessed: cursor,
    result,
  };
};

const compileStatements = (
  xmls: string[],
  indentLevel: number,
  result: string[],
): CompileResult => {
  const _handleStatements = (
    _xmls: string[],
    _indentLevel: number,
    _result: string[],
  ): CompileResult => {
    let _cursor = 0;
    const nextXml = _xmls[_cursor++];
    if (!nextXml) {
      return { cursorProcessed: _cursor, result: _result };
    }

    const { tag, value } = parseSingleLineXml(nextXml);
    if (tag !== 'keyword') {
      return { cursorProcessed: _cursor - 1, result: _result };
    }

    switch (value) {
      case 'let': {
        _result.push(indentation('<letStatement>', _indentLevel - 1));
        _result.push(indentation(nextXml, _indentLevel));
        _result.push(indentation(_xmls[_cursor++], _indentLevel));
        _result.push(indentation(_xmls[_cursor++], _indentLevel));
        if (parseSingleLineXml(_xmls[_cursor - 1]).value !== '=') {
          throw new Error('let statement only handles "=". current: ' + _xmls[_cursor]);
        }
        _cursor += compileExpression(
          _xmls.slice(_cursor),
          _indentLevel + 1,
          _result,
        ).cursorProcessed;
        _result.push(indentation(_xmls[_cursor++], _indentLevel));

        _result.push(indentation('</letStatement>', _indentLevel - 1));

        break;
      }
      case 'if': {
        _result.push(indentation('<ifStatement>', _indentLevel - 1));

        _result.push(indentation(nextXml, _indentLevel)); // if
        _result.push(indentation(_xmls[_cursor++], _indentLevel)); // (
        _cursor += compileExpression(
          _xmls.slice(_cursor),
          _indentLevel + 1,
          _result,
        ).cursorProcessed;
        _result.push(indentation(_xmls[_cursor++], _indentLevel)); // )

        _result.push(indentation(_xmls[_cursor++], _indentLevel));
        _result.push(indentation('<statements>', _indentLevel));
        _cursor += compileStatements(
          _xmls.slice(_cursor),
          _indentLevel + 1,
          _result,
        ).cursorProcessed;
        _result.push(indentation('</statements>', _indentLevel));
        _result.push(indentation(_xmls[_cursor++], _indentLevel));

        if (parseSingleLineXml(_xmls[_cursor]).value === 'else') {
          _result.push(indentation(_xmls[_cursor++], _indentLevel)); // else
          _result.push(indentation(_xmls[_cursor++], _indentLevel)); // {
          _result.push(indentation('<statements>', _indentLevel));
          _cursor += compileStatements(
            _xmls.slice(_cursor),
            _indentLevel + 1,
            _result,
          ).cursorProcessed;
          _result.push(indentation('</statements>', _indentLevel));
          _result.push(indentation(_xmls[_cursor++], _indentLevel)); // }
        }

        _result.push(indentation('</ifStatement>', _indentLevel - 1));

        break;
      }
      case 'while': {
        _result.push(indentation('<whileStatement>', _indentLevel - 1));

        _result.push(indentation(nextXml, _indentLevel)); // while
        _result.push(indentation(_xmls[_cursor++], _indentLevel)); // (
        _cursor += compileExpression(
          _xmls.slice(_cursor),
          _indentLevel + 1,
          _result,
        ).cursorProcessed;
        _result.push(indentation(_xmls[_cursor++], _indentLevel)); // )

        _result.push(indentation(_xmls[_cursor++], _indentLevel));
        _result.push(indentation('<statements>', _indentLevel));
        _cursor += compileStatements(
          _xmls.slice(_cursor),
          _indentLevel + 1,
          _result,
        ).cursorProcessed;
        _result.push(indentation('</statements>', _indentLevel));
        _result.push(indentation(_xmls[_cursor++], _indentLevel));

        _result.push(indentation('</whileStatement>', _indentLevel - 1));

        break;
      }
      case 'do': {
        _result.push(indentation('<doStatement>', _indentLevel - 1));
        _result.push(indentation(nextXml, _indentLevel));
        _result.push(indentation(_xmls[_cursor++], _indentLevel));

        if (parseSingleLineXml(_xmls[_cursor]).value === '.') {
          _result.push(indentation(_xmls[_cursor++], _indentLevel));
          _result.push(indentation(_xmls[_cursor++], _indentLevel));
        }

        _result.push(indentation(_xmls[_cursor++], _indentLevel)); // parenthesis open
        _cursor += compileExpressionList(
          _xmls.slice(_cursor),
          _indentLevel + 1,
          _result,
        ).cursorProcessed;
        _result.push(indentation(_xmls[_cursor++], _indentLevel)); // parenthesis close
        _result.push(indentation(_xmls[_cursor++], _indentLevel)); // semicolon

        _result.push(indentation('</doStatement>', _indentLevel - 1));

        break;
      }
      case 'return': {
        _result.push(indentation('<returnStatement>', _indentLevel - 1));

        _result.push(indentation(nextXml, _indentLevel)); // return

        if (parseSingleLineXml(_xmls[_cursor]).value !== ';') {
          _cursor += compileExpression(
            _xmls.slice(_cursor),
            _indentLevel + 1,
            _result,
          ).cursorProcessed;
        }

        _result.push(indentation(_xmls[_cursor++], _indentLevel)); // semicolon

        _result.push(indentation('</returnStatement>', _indentLevel - 1));

        break;
      }
      default:
        throw new Error('Invalid XML.');
    }

    return {
      cursorProcessed:
        _cursor + _handleStatements(_xmls.slice(_cursor), _indentLevel, _result).cursorProcessed,
      result: _result,
    };
  };

  const { cursorProcessed } = _handleStatements(xmls, indentLevel + 1, result);

  return { cursorProcessed, result };
};

const handleSubroutineBody = (
  xmls: string[],
  indentLevel: number,
  result: string[],
): CompileResult => {
  result.push(indentation('<subroutineBody>', indentLevel - 1));

  let cursor = 0;
  const subroutineBodyStartSymbolXml = xmls[cursor++];
  result.push(indentation(subroutineBodyStartSymbolXml, indentLevel));

  const _handleSubroutineStatements = (
    _xmls: string[],
    _indentLevel: number,
    _result: string[],
  ): CompileResult => {
    let _cursor = 0;
    const nextXml = _xmls[_cursor];

    if (!nextXml) {
      return { cursorProcessed: _cursor, result: _result };
    }

    const { value } = parseSingleLineXml(nextXml);

    if (['let', 'if', 'while', 'do', 'return'].includes(value)) {
      _cursor += compileStatements(_xmls.slice(_cursor), _indentLevel + 1, _result).cursorProcessed;
      _cursor += _handleSubroutineStatements(
        _xmls.slice(_cursor),
        _indentLevel,
        _result,
      ).cursorProcessed;
    }

    return {
      cursorProcessed: _cursor,
      result: _result,
    };
  };

  const _handleSubroutineBody = (
    _xmls: string[],
    _indentLevel: number,
    _result: string[],
  ): CompileResult => {
    let _cursor = 0;
    const nextXml = _xmls[_cursor];
    if (!nextXml) {
      return { cursorProcessed: _cursor, result: _result };
    }

    const { value } = parseSingleLineXml(_xmls[_cursor]);

    if (value === 'var') {
      _cursor += compileVarDec(_xmls.slice(_cursor), _indentLevel + 1, _result).cursorProcessed;
      _cursor += _handleSubroutineBody(_xmls.slice(_cursor), _indentLevel, _result).cursorProcessed;
    }

    if (['let', 'if', 'while', 'do', 'return'].includes(value)) {
      result.push(indentation('<statements>', indentLevel));
      _cursor += _handleSubroutineStatements(
        _xmls.slice(_cursor),
        _indentLevel,
        _result,
      ).cursorProcessed;
      result.push(indentation('</statements>', indentLevel));
    }

    return {
      cursorProcessed: _cursor,
      result: _result,
    };
  };

  cursor += _handleSubroutineBody(xmls.slice(cursor), indentLevel, result).cursorProcessed;

  // TODO: print subroutineBodyEndSymbolXml
  result.push(indentation(xmls[cursor++], indentLevel));
  result.push(indentation('</subroutineBody>', indentLevel - 1));

  return {
    cursorProcessed: cursor,
    result,
  };
};

const compileSubroutineDec = (
  xmls: string[],
  indentLevel: number,
  result: string[],
): CompileResult => {
  result.push(indentation('<subroutineDec>', indentLevel - 1));

  let cursor = 0;
  const keywordXml = xmls[cursor++];
  const typeXml = xmls[cursor++];
  const subroutineNameXml = xmls[cursor++];

  result.push(indentation(keywordXml, indentLevel));
  result.push(indentation(typeXml, indentLevel));
  result.push(indentation(subroutineNameXml, indentLevel));

  cursor += handleParameterList(xmls.slice(cursor), indentLevel + 1, result).cursorProcessed;
  cursor += handleSubroutineBody(xmls.slice(cursor), indentLevel + 1, result).cursorProcessed;

  result.push(indentation('</subroutineDec>', indentLevel - 1));

  return { cursorProcessed: cursor, result };
};
