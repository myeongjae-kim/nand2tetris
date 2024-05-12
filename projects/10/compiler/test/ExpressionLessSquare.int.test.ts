import { describe, expect, it } from 'vitest';
import { jackAnalyzer } from '../src/jackAnalyzer';
import { fileTestTemplate } from './testHelper';
import { readFilePromise } from '../src/readFilePromise';
import { compilationEngine } from '../src/compilationEngine';

describe('ExpressionLessSquare', () => {
  it('should compile Main.jack', async () => {
    const jackPath = './test/res/ExpressionLessSquare/Main.jack';
    const tokenXmlPath = './test/res/ExpressionLessSquare/MainT.xml';
    const xmlPath = './test/res/ExpressionLessSquare/Main.xml';
    const expectedTokenXmlPath = './test/res/expected/ExpressionLessSquare/MainT.xml';
    const expectedXmlPath = './test/res/expected/ExpressionLessSquare/Main.xml';

    await fileTestTemplate(
      async () => {
        await jackAnalyzer(jackPath);

        const [tokenXml, expectedTokenXml] = await Promise.all([
          readFilePromise(tokenXmlPath),
          readFilePromise(expectedTokenXmlPath),
        ]);

        expect(tokenXml).toBe(expectedTokenXml.replace(/\r/g, '').trim());

        await compilationEngine(tokenXmlPath);
        const [xml, expectedXml] = await Promise.all([
          readFilePromise(xmlPath),
          readFilePromise(expectedXmlPath),
        ]);

        expect(xml).toBe(expectedXml.trim().replace(/\r/g, ''));
      },
      tokenXmlPath,
      xmlPath,
    );
  });

  it('should compile Square.jack', async () => {
    const jackPath = './test/res/ExpressionLessSquare/Square.jack';
    const tokenXmlPath = './test/res/ExpressionLessSquare/SquareT.xml';
    const xmlPath = './test/res/ExpressionLessSquare/Square.xml';
    const expectedTokenXmlPath = './test/res/expected/ExpressionLessSquare/SquareT.xml';
    const expectedXmlPath = './test/res/expected/ExpressionLessSquare/Square.xml';

    await fileTestTemplate(async () => {
      await jackAnalyzer(jackPath);

      const [tokenXml, expectedTokenXml] = await Promise.all([
        readFilePromise(tokenXmlPath),
        readFilePromise(expectedTokenXmlPath),
      ]);

      expect(tokenXml).toBe(expectedTokenXml.replace(/\r/g, '').trim());

      await compilationEngine(tokenXmlPath);
      const [xml, expectedXml] = await Promise.all([
        readFilePromise(xmlPath),
        readFilePromise(expectedXmlPath),
      ]);

      expect(xml).toBe(expectedXml.trim().replace(/\r/g, ''));
    }, tokenXmlPath);
  });

  it('should compile SquareGame.jack', async () => {
    const jackPath = './test/res/ExpressionLessSquare/SquareGame.jack';
    const tokenXmlPath = './test/res/ExpressionLessSquare/SquareGameT.xml';
    const expectedTokenXmlPath = './test/res/expected/ExpressionLessSquare/SquareGameT.xml';

    await fileTestTemplate(async () => {
      await jackAnalyzer(jackPath);

      const [xml, expectedXml] = await Promise.all([
        readFilePromise(tokenXmlPath),
        readFilePromise(expectedTokenXmlPath),
      ]);

      expect(xml).toBe(expectedXml.replace(/\r/g, '').trim());
    }, tokenXmlPath);
  });

  it('should compile a directory', async () => {
    await fileTestTemplate(
      () => jackAnalyzer('./test/res/ExpressionLessSquare'),
      './test/res/ExpressionLessSquare/SquareT.xml',
      './test/res/ExpressionLessSquare/SquareGameT.xml',
      './test/res/ExpressionLessSquare/MainT.xml',
      './test/res/ExpressionLessSquare/Square.xml',
      './test/res/ExpressionLessSquare/SquareGame.xml',
      './test/res/ExpressionLessSquare/Main.xml',
    );
  });
});
