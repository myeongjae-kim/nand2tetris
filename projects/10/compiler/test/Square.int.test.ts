import { describe, expect, it } from 'vitest';
import { jackAnalyzer } from '../src/jackAnalyzer';
import { fileTestTemplate } from './testHelper';
import { readFilePromise } from '../src/readFilePromise';

describe('Square', () => {
  it('should compile Main.jack', async () => {
    const jackPath = './test/res/Square/Main.jack';
    const tokenXmlPath = './test/res/Square/MainT.xml';
    const expectedTokenXmlPath = './test/res/expected/Square/MainT.xml';

    await fileTestTemplate(async () => {
      await jackAnalyzer(jackPath);

      const [xml, expectedXml] = await Promise.all([
        readFilePromise(tokenXmlPath),
        readFilePromise(expectedTokenXmlPath),
      ]);

      expect(xml).toBe(expectedXml.replace(/\r/g, '').trim());
    }, tokenXmlPath);
  });

  it('should compile Square.jack', async () => {
    const jackPath = './test/res/Square/Square.jack';
    const tokenXmlPath = './test/res/Square/SquareT.xml';
    const expectedTokenXmlPath = './test/res/expected/Square/SquareT.xml';

    await fileTestTemplate(async () => {
      await jackAnalyzer(jackPath);

      const [xml, expectedXml] = await Promise.all([
        readFilePromise(tokenXmlPath),
        readFilePromise(expectedTokenXmlPath),
      ]);

      expect(xml).toBe(expectedXml.replace(/\r/g, '').trim());
    }, tokenXmlPath);
  });

  it('should compile SquareGame.jack', async () => {
    const jackPath = './test/res/Square/SquareGame.jack';
    const tokenXmlPath = './test/res/Square/SquareGame.xml';
    const expectedTokenXmlPath = './test/res/expected/Square/SquareGameT.xml';

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
      () => jackAnalyzer('./test/res/Square'),
      './test/res/Square/SquareT.xml',
      './test/res/Square/SquareGameT.xml',
      './test/res/Square/MainT.xml',
      './test/res/Square/Square.xml',
      './test/res/Square/SquareGame.xml',
      './test/res/Square/Main.xml',
    );
  });
});
