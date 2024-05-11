import { describe, expect, it } from 'vitest';
import { jackAnalyzer } from '../src/jackAnalyzer';
import { fileTestTemplate } from './testHelper';
import { readFilePromise } from '../src/readFilePromise';

describe('Square', () => {
  it('should compile Main.jack', async () => {
    const jackPath = './test/res/Square/Main.jack';
    const xmlPath = './test/res/Square/Main.xml';
    const expectedXmlPath = './test/res/expected/Square/MainT.xml';

    await fileTestTemplate(async () => {
      await jackAnalyzer(jackPath);

      const [xml, expectedXml] = await Promise.all([
        readFilePromise(xmlPath),
        readFilePromise(expectedXmlPath),
      ]);

      expect(xml).toBe(expectedXml.replace(/\r/g, '').trim());
    }, xmlPath);
  });

  it('should compile Square.jack', async () => {
    const jackPath = './test/res/Square/Square.jack';
    const xmlPath = './test/res/Square/Square.xml';
    const expectedXmlPath = './test/res/expected/Square/SquareT.xml';

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
    const jackPath = './test/res/Square/SquareGame.jack';
    const xmlPath = './test/res/Square/SquareGame.xml';
    const expectedXmlPath = './test/res/expected/Square/SquareGameT.xml';

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
      () => jackAnalyzer('./test/res/Square'),
      './test/res/Square/Square.xml',
      './test/res/Square/SquareGame.xml',
      './test/res/Square/Main.xml',
    );
  });
});
