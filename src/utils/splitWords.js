// Splits element text into word spans for masked reveal animation.
// Preserves \n as <br> between lines.
export function splitWords(element) {
  const lines = element.textContent.trim().split('\n')
  const html = lines
    .map((line, lineIdx) => {
      const spans = line
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map(
          (word) =>
            `<span style="display:inline-block;overflow:hidden;vertical-align:bottom;">` +
            `<span style="display:inline-block;">${word}</span>` +
            `</span>`
        )
        .join(' ')
      return lineIdx < lines.length - 1 ? spans + '<br>' : spans
    })
    .join('')
  element.innerHTML = html
  return Array.from(element.querySelectorAll(':scope > span > span'))
}
