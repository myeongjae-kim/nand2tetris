import { describe, expect, it } from 'vitest';
import { jackAnalyzer } from '../../src/jackAnalyzer';
import { fileTestTemplate } from '../testHelper';
import { readFilePromise } from '../../src/readFilePromise';
import { compilationEngine } from '../../src/compilationEngine';

describe('SquareTest', () => {
  it('should compile Main.jack', async () => {
    const jackPath = './test/res/11/Square/Main.jack';
    const tokenXmlPath = './test/res/11/Square/MainT.xml';
    const xmlPath = './test/res/11/Square/Main.xml';
    const vmPath = './test/res/11/Square/Main.vm';
    const expectedVmPath = './test/res/11/expected/Square/Main.vm';

    await fileTestTemplate(
      async () => {
        await jackAnalyzer(jackPath);
        await compilationEngine({ tokenXmlPaths: [tokenXmlPath], printVmCode: true });

        const [vm, expectedVm] = await Promise.all([
          readFilePromise(vmPath),
          readFilePromise(expectedVmPath),
        ]);

        expect(vm).toBe(expectedVm.trim().replace(/\r/g, ''));
      },
      tokenXmlPath,
      xmlPath,
      vmPath,
    );
  });

  it('should compile Square.jack', async () => {
    const jackPath = './test/res/11/Square/Square.jack';
    const tokenXmlPath = './test/res/11/Square/SquareT.xml';
    const xmlPath = './test/res/11/Square/Square.xml';
    const vmPath = './test/res/11/Square/Square.vm';
    const expectedVmPath = './test/res/11/expected/Square/Square.vm';

    await fileTestTemplate(
      async () => {
        await jackAnalyzer(jackPath);
        await compilationEngine({ tokenXmlPaths: [tokenXmlPath], printVmCode: true });

        const [vm, expectedVm] = await Promise.all([
          readFilePromise(vmPath),
          readFilePromise(expectedVmPath),
        ]);

        expect(vm).toBe(expectedVm.trim().replace(/\r/g, ''));
      },
      tokenXmlPath,
      xmlPath,
      vmPath,
    );
  });

  it('should compile SquareGame.jack', async () => {
    const jackPath = './test/res/11/Square/SquareGame.jack';
    const tokenXmlPath = './test/res/11/Square/SquareGameT.xml';
    const xmlPath = './test/res/11/Square/SquareGame.xml';
    const vmPath = './test/res/11/Square/SquareGame.vm';
    const expectedVmPath = './test/res/11/expected/Square/SquareGame.vm';

    await fileTestTemplate(
      async () => {
        await jackAnalyzer(jackPath);
        await compilationEngine({ tokenXmlPaths: [tokenXmlPath], printVmCode: true });

        const [vm, expectedVm] = await Promise.all([
          readFilePromise(vmPath),
          readFilePromise(expectedVmPath),
        ]);

        expect(vm).toBe(expectedVm.trim().replace(/\r/g, ''));
      },
      tokenXmlPath,
      xmlPath,
      vmPath,
    );
  });
});
