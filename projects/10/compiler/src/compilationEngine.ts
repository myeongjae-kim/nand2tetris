export const compilationEngine = (xmls: string[]): string => {
  return compile(xmls).join('\n');
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

    if (value === '{') {
      // TODO: handle subroutine body in compileSubroutineDec
      return { cursorProcessed: cursor, result: _result };
    }

    nextXml = _xmls[cursor];
    if (!nextXml) {
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

  _compileClass(xmls.slice(cursor), indentLevel, result);

  result.push(indentation('</class>', indentLevel - 1));

  return result;
};

const handleVarDecs = (xmls: string[], indentLevel: number, result: string[]): CompileResult => {
  let cursor = 0;
  const staticOrFieldXml = xmls[cursor++];
  const typeXml = xmls[cursor++];
  const varNameXml = xmls[cursor++];
  const commaOrSemicolonXml = xmls[cursor++];

  result.push(indentation(staticOrFieldXml, indentLevel));
  result.push(indentation(typeXml, indentLevel));
  result.push(indentation(varNameXml, indentLevel));
  result.push(indentation(commaOrSemicolonXml, indentLevel));

  const commaOrSemicolonParsed = parseSingleLineXml(commaOrSemicolonXml);
  if (commaOrSemicolonParsed.tag !== 'symbol') {
    throw Error('Invalid XML.');
  }

  if (commaOrSemicolonParsed.value === ',') {
    const { cursorProcessed, result: resultToReturn } = handleVarDecs(
      xmls.slice(4),
      indentLevel,
      result,
    );

    return {
      cursorProcessed: cursor + cursorProcessed,
      result: resultToReturn,
    };
  }

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

  const parameterListStartSymbolXml = xmls[cursor++];
  // TODO: parametsrs
  const parameterListEndSymbolXml = xmls[cursor++];

  result.push(indentation(parameterListStartSymbolXml, indentLevel - 1));
  result.push(indentation('<parameterList>', indentLevel - 1));

  result.push(indentation('</parameterList>', indentLevel - 1));
  result.push(indentation(parameterListEndSymbolXml, indentLevel - 1));

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

  result.push(indentation('</subroutineDec>', indentLevel - 1));

  return { cursorProcessed: cursor, result };
};
