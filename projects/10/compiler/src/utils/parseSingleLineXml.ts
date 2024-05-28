import { SingleLineXml } from './SingleLineXml';

export const parseSingleLineXml = (xml: string): SingleLineXml => {
  const tagStart = xml.indexOf('<');
  const tagEnd = xml.indexOf('>');
  if (tagStart === -1 || tagEnd === -1) {
    throw Error('Invalid XML.');
  }

  const tag = xml.slice(tagStart + 1, tagEnd);

  const closeTagStart = xml.indexOf('</');

  const value = xml.slice(tagEnd + 1, closeTagStart).slice(1, -1);

  return { tag, value };
};
