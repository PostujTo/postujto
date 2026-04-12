export function parsePlainTextToPosts(text: string): Array<{
  text: string;
  hashtags: string[];
  imagePrompt: string;
}> {
  const parts = text.split('---WERSJA---').filter(p => p.trim());

  if (parts.length === 0) {
    return [{ text: text.trim(), hashtags: [], imagePrompt: '' }];
  }

  return parts.map(part => {
    const [textPart, rest] = part.split('---HASHTAGI---');
    const [hashtagsPart, imagePart] = (rest || '').split('---PROMPT_OBRAZU---');

    const hashtagsRaw = hashtagsPart?.trim() ?? '';
    const hashtags = hashtagsRaw
      ? hashtagsRaw.split(/\s+/).filter(t => t.length > 0)
      : [];

    return {
      text: textPart?.trim() ?? '',
      hashtags,
      imagePrompt: imagePart?.trim() ?? '',
    };
  });
}
