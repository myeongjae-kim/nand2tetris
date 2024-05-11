import { describe, expect, it } from 'vitest';
import { jackAnalyzer } from '../src/jackAnalyzer';
import { fileTestTemplate } from './testHelper';
import { readFilePromise } from '../src/readFilePromise';

const indentation = (xml: string, indentLevel: number) => ' '.repeat(indentLevel * 2) + xml;

const parseClassTokens = (xmls: string[], indentLevel: number, result: string[]): string[] => {
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

const parseTokens = (xmls: string[], indentLevel = 0, result = []): string[] => {
  if (xmls.length === 0) {
    return result;
  }

  if (xmls[0] === '<tokens>') {
    return parseTokens(xmls.slice(1), indentLevel, result);
  }

  if (xmls[0].startsWith('<keyword>')) {
    const keyword = xmls[0].replace('<keyword>', '').replace('</keyword>', '').trim();

    if (keyword === 'class') {
      return parseClassTokens(xmls, indentLevel + 1, result);
    }
  }

  return result;
};

describe('ExpressionLessSquare', () => {
  it('should compile Main.jack', async () => {
    const jackPath = './test/res/ExpressionLessSquare/Main.jack';
    const xmlPath = './test/res/ExpressionLessSquare/Main.xml';
    const expectedXmlPath = './test/res/expected/ExpressionLessSquare/MainT.xml';

    await fileTestTemplate(async () => {
      await jackAnalyzer(jackPath);

      const [xml, expectedXml] = await Promise.all([
        readFilePromise(xmlPath),
        readFilePromise(expectedXmlPath),
      ]);

      expect(xml).toBe(expectedXml.replace(/\r/g, '').trim());

      console.log(parseTokens(xml.split('\n').map((it) => it.trim())).join('\n'));
    }, xmlPath);
  });

  it('should compile Square.jack', async () => {
    const jackPath = './test/res/ExpressionLessSquare/Square.jack';
    const xmlPath = './test/res/ExpressionLessSquare/Square.xml';
    const expectedXmlPath = './test/res/expected/ExpressionLessSquare/SquareT.xml';

    await fileTestTemplate(async () => {
      await jackAnalyzer(jackPath);

      const [xml, expectedXml] = await Promise.all([
        readFilePromise(xmlPath),
        readFilePromise(expectedXmlPath),
      ]);

      expect(xml).toBe(expectedXml.replace(/\r/g, '').trim());
    }, xmlPath);
  });

  it('should compile SquareGame.jack', async () => {
    const jackPath = './test/res/ExpressionLessSquare/SquareGame.jack';
    const xmlPath = './test/res/ExpressionLessSquare/SquareGame.xml';
    const expectedXmlPath = './test/res/expected/ExpressionLessSquare/SquareGameT.xml';

    await fileTestTemplate(async () => {
      await jackAnalyzer(jackPath);

      const [xml, expectedXml] = await Promise.all([
        readFilePromise(xmlPath),
        readFilePromise(expectedXmlPath),
      ]);

      expect(xml).toBe(expectedXml.replace(/\r/g, '').trim());
    }, xmlPath);
  });

  it('should compile a directory', async () => {
    await fileTestTemplate(
      () => jackAnalyzer('./test/res/ExpressionLessSquare'),
      './test/res/ExpressionLessSquare/Square.xml',
      './test/res/ExpressionLessSquare/SquareGame.xml',
      './test/res/ExpressionLessSquare/Main.xml',
    );
  });
});
