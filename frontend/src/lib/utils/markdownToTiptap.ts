/**
 * markdownToTiptap
 *
 * Converts a markdown string to a TipTap-compatible JSON document.
 * Uses only StarterKit nodes — no extra packages needed.
 *
 * Supported syntax:
 *   #### Heading 4 → heading level 4
 *   ### Heading 3  → heading level 3
 *   ## Heading 2   → heading level 2
 *   # Heading 1    → heading level 1
 *   > blockquote   → blockquote
 *   **bold**       → bold mark
 *   *italic*       → italic mark (also _italic_)
 *   ~~strike~~     → strike mark
 *   ---            → horizontal rule
 *   plain text     → paragraph
 *
 * This is intentionally minimal — it handles the subset of markdown
 * that writers use in Narrative Forge. Full CommonMark support is not
 * the goal; round-trippable storage for creative writing content is.
 */

/* ── TipTap JSON types ──────────────────────────────────────────── */

type Mark =
    | { type: 'bold' }
    | { type: 'italic' }
    | { type: 'strike' }

interface TextNode {
    type: 'text'
    text: string
    marks?: Mark[]
}

interface ParagraphNode {
    type: 'paragraph'
    content: TextNode[]
}

interface HeadingNode {
    type: 'heading'
    attrs: { level: number }
    content: TextNode[]
}

interface BlockquoteNode {
    type: 'blockquote'
    content: ParagraphNode[]
}

interface HorizontalRuleNode {
    type: 'horizontalRule'
}

type BlockNode =
    | ParagraphNode
    | HeadingNode
    | BlockquoteNode
    | HorizontalRuleNode

interface TipTapDocument {
    type: 'doc'
    content: BlockNode[]
}

/* ── Inline parser ──────────────────────────────────────────────── */

/**
 * Parses inline markdown marks (bold, italic, strike) in a text line.
 * Returns an array of TipTap text nodes with the appropriate marks.
 */
function parseInline(text: string): TextNode[] {
    if (!text) return []

    const nodes: TextNode[] = []

    /*
     * Regex captures:
     *   \*\*(.+?)\*\*  → bold
     *   ~~(.+?)~~      → strikethrough
     *   \*(.+?)\*      → italic (single asterisk)
     *   _(.+?)_        → italic (underscore)
     *   [^*_~]+        → plain text (no marks)
     *
     * Order matters: ** must come before * to avoid partial matches.
     */
    const pattern =
        /\*\*(.+?)\*\*|~~(.+?)~~|\*(.+?)\*|_(.+?)_|([^*_~]+)/gs

    let match: RegExpExecArray | null

    while ((match = pattern.exec(text)) !== null) {
        const [, bold, strike, italicAst, italicUnd, plain] = match

        if (bold !== undefined) {
            nodes.push({ type: 'text', text: bold, marks: [{ type: 'bold' }] })
        } else if (strike !== undefined) {
            nodes.push({ type: 'text', text: strike, marks: [{ type: 'strike' }] })
        } else if (italicAst !== undefined) {
            nodes.push({ type: 'text', text: italicAst, marks: [{ type: 'italic' }] })
        } else if (italicUnd !== undefined) {
            nodes.push({ type: 'text', text: italicUnd, marks: [{ type: 'italic' }] })
        } else if (plain !== undefined) {
            nodes.push({ type: 'text', text: plain })
        }
    }

    return nodes
}

/* ── Block parser ───────────────────────────────────────────────── */

function parseLine(line: string): BlockNode {
    // Horizontal rule
    if (/^[-*]{3,}$/.test(line.trim())) {
        return { type: 'horizontalRule' }
    }

    // Headings: up to 6 levels
    const headingMatch = /^(#{1,6})\s+(.*)/.exec(line)
    if (headingMatch) {
        const level = headingMatch[1].length
        const content = headingMatch[2]
        return {
            type: 'heading',
            attrs: { level },
            content: parseInline(content),
        }
    }

    // Blockquote
    const blockquoteMatch = /^>\s?(.*)/.exec(line)
    if (blockquoteMatch) {
        return {
            type: 'blockquote',
            content: [{
                type: 'paragraph',
                content: parseInline(blockquoteMatch[1]),
            }],
        }
    }

    // Paragraph (default)
    return {
        type: 'paragraph',
        content: parseInline(line),
    }
}

/* ── Main export ────────────────────────────────────────────────── */

/**
 * Converts a markdown string to a TipTap JSON document object.
 * Returns null if the input is empty so callers can skip setContent.
 */
export function markdownToTiptap(markdown: string): TipTapDocument | null {
    const trimmed = markdown.trim()
    if (!trimmed) return null

    const lines = trimmed.split('\n')
    const content = lines.map(parseLine)

    return { type: 'doc', content }
}

/**
 * Returns true if the string looks like TipTap JSON (starts with "{").
 * Used to distinguish legacy JSON content from markdown in the DB.
 */
export function isTipTapJson(content: string): boolean {
    return content.trimStart().startsWith('{')
}