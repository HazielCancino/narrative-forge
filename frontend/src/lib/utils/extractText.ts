import type { JSONContent } from '@tiptap/react'

const BLOCK_TYPES = new Set([
    'doc',
    'paragraph',
    'heading',
    'blockquote',
    'bulletList',
    'orderedList',
    'listItem',
    'codeBlock',
])

/**
 * Recursively extracts plain text from a TipTap JSONContent node.
 * Block-level nodes are joined with newlines to preserve readability
 * when injected into an LLM prompt.
 */
export function extractPlainText(
    node: JSONContent | null | undefined,
): string {
    if (!node) return ''
    if (node.type === 'text') return node.text ?? ''
    if (!node.content?.length) return ''

    const children = node.content.map(extractPlainText).filter(Boolean)
    const separator = BLOCK_TYPES.has(node.type ?? '') ? '\n' : ''
    return children.join(separator)
}