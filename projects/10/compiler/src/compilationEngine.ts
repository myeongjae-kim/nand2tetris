export const compilationEngine = (xmls: string[]): string => {
  return compile(xmls).join('\n');
};

type SingleLineXml = {
  tag: string;
  value: string;
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
    return compile(xmls.slice(1), indentLevel, result);
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

  const keywordXml = xmls[0];
  const identifierXml = xmls[1];
  const curlyBraceStartXml = xmls[2];

  // indent 붙여서 result에 추가
  result.push(indentation(keywordXml, indentLevel));
  result.push(indentation(identifierXml, indentLevel));
  result.push(indentation(curlyBraceStartXml, indentLevel));

  const nextXml = xmls[3];

  // TODO: keyword 처리하는 부분 함수로 만들기
  if (nextXml) {
    const keyword = xmls[0].replace('<keyword>', '').replace('</keyword>', '').trim();

    if (keyword === 'static') {
      // result = parseClassVarDec(xmls, indentLevel, result);
    }
  }

  result.push(indentation('</class>', indentLevel - 1));

  return result;
};
