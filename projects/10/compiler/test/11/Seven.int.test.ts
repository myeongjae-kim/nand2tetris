import { describe, expect, it } from 'vitest';
import { jackAnalyzer } from '../../src/jackAnalyzer';
import { fileTestTemplate } from '../testHelper';
import { readFilePromise } from '../../src/readFilePromise';
import { compilationEngine } from '../../src/compilationEngine';

describe('SevenTest', () => {
  it('should compile Main.jack', async () => {
    const jackPath = './test/res/11/Seven/Main.jack';
    const tokenXmlPath = './test/res/11/Seven/MainT.xml';
    const xmlPath = './test/res/11/Seven/Main.xml';
    const vmPath = './test/res/11/Seven/Main.vm';
    const expectedVmPath = './test/res/11/expected/Seven/Main.vm';

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
