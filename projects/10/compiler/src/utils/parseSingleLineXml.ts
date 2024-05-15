import { SingleLineXml } from './SingleLineXml';

export const parseSingleLineXml = (xml: string): SingleLineXml => {
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
