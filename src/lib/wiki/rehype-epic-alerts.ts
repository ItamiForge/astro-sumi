type HastNode = {
  type: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
}

const ALERTS: Record<
  string,
  { label: string; className: string }
> = {
  NOTE: { label: 'Note', className: 'epic-alert epic-alert-note' },
  TIP: { label: 'Tip', className: 'epic-alert epic-alert-tip' },
  WARNING: { label: 'Warning', className: 'epic-alert epic-alert-warning' },
  IMPORTANT: { label: 'Important', className: 'epic-alert epic-alert-important' },
  PROPHECY: { label: 'Prophecy', className: 'epic-alert epic-alert-prophecy' },
  CODEX: { label: 'Codex', className: 'epic-alert epic-alert-codex' },
  SONG: { label: 'Song', className: 'epic-alert epic-alert-song' },
  LOG: { label: "Captain's Log", className: 'epic-alert epic-alert-log' },
  TRANSLATION: {
    label: 'Translation',
    className: 'epic-alert epic-alert-translation',
  },
  FORBIDDEN: { label: 'Forbidden', className: 'epic-alert epic-alert-forbidden' },
}

const MARKER = /^\s*\[!([A-Z]+)\]\s*$/

export function rehypeEpicAlerts() {
  return function transformer(tree: HastNode) {
    walk(tree)
  }
}

function walk(node: HastNode) {
  if (!node.children) return
  for (const child of node.children) {
    if (child.tagName === 'blockquote') convertBlockquote(child)
    walk(child)
  }
}

function convertBlockquote(node: HastNode) {
  const children = node.children ?? []
  const firstParagraph = children.find((child) => child.tagName === 'p')
  if (!firstParagraph?.children) return

  const firstText = firstParagraph.children.find((child) => child.type === 'text')
  if (!firstText?.value) return

  const lines = firstText.value.split('\n')
  const markerLine = lines[0]?.trim() ?? ''
  const match = MARKER.exec(markerLine)
  if (!match?.[1]) return

  const kind = ALERTS[match[1]]
  if (!kind) return

  const remainder = lines.slice(1).join('\n').trim()
  if (remainder) {
    firstText.value = remainder
  } else {
    firstParagraph.children = firstParagraph.children.filter(
      (child) => child !== firstText,
    )
    if (
      firstParagraph.children.length === 0 ||
      (firstParagraph.children.length === 1 &&
        firstParagraph.children[0]?.type === 'text' &&
        !firstParagraph.children[0].value?.trim())
    ) {
      node.children = children.filter((child) => child !== firstParagraph)
    }
  }

  node.tagName = 'aside'
  node.properties = {
    className: kind.className.split(' '),
    'data-alert': match[1].toLowerCase(),
  }
  node.children = [
    {
      type: 'element',
      tagName: 'p',
      properties: { className: ['epic-alert-label'] },
      children: [{ type: 'text', value: kind.label }],
    },
    ...(node.children ?? []),
  ]
}
