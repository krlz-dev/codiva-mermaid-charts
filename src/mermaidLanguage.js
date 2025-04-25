import { StreamLanguage } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorView } from '@codemirror/view';

const mermaidSyntax = StreamLanguage.define({
  name: 'mermaid',
  startState: () => ({
    inString: false,
    stringType: null,
  }),
  token: (stream, state) => {
    // Handle keywords at start of line or after newline
    if (stream.sol() || stream.peek() === '\n') {
      const keywords = [
        'graph', 'flowchart', 'sequenceDiagram', 'classDiagram',
        'stateDiagram', 'erDiagram', 'pie', 'gantt', 'journey',
        'subgraph', 'end', 'architecture-beta', 'group', 'service'
      ];
      const word = stream.match(/^\s*(\w+[-]?\w*)/) && stream.current().trim();
      if (word && keywords.includes(word)) {
        return 'keyword';
      }
    }

    // Handle arrows and connections
    if (stream.match(/^(-->|---|==>|-.->|\|)/)) return 'operator';
    
    // Handle brackets and parentheses
    if (stream.match(/^(\[|\]|\(|\)|\{|\})/)) return 'bracket';
    
    // Handle strings in quotes
    if (stream.match(/^"([^"]*)"/) || stream.match(/^'([^']*)'/) || stream.match(/^`([^`]*)`/)) return 'string';
    
    // Handle special identifiers like logos:aws-*
    if (stream.match(/^(\w+:[-\w]+)/)) return 'variable';
    
    // Handle numbers
    if (stream.match(/^\d+/)) return 'number';
    
    stream.next();
    return null;
  },
  tokenTable: {
    keyword: t.keyword,
    operator: t.operator,
    bracket: t.bracket,
    string: t.string,
    variable: t.variableName,
    number: t.number,
  },
});

// Create a Monokai-inspired theme
const monokaiTheme = HighlightStyle.define([
  { tag: t.keyword, color: '#F92672' },           // Pink for keywords
  { tag: t.operator, color: '#F92672' },          // Pink for operators
  { tag: t.bracket, color: '#FFFFFF' },           // White for brackets
  { tag: t.string, color: '#E6DB74' },           // Yellow for strings
  { tag: t.variableName, color: '#66D9EF' },     // Blue for variables/identifiers
  { tag: t.number, color: '#AE81FF' },           // Purple for numbers
]);

// Theme extension for the editor background and text color
const monokaiBackground = EditorView.theme({
  '&': {
    backgroundColor: '#272822',
    color: '#F8F8F2'
  },
  '.cm-content': {
    caretColor: '#F8F8F2'
  },
  '.cm-cursor': {
    borderLeftColor: '#F8F8F2'
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: '#49483E'
  },
  '.cm-gutters': {
    backgroundColor: '#272822',
    color: '#75715E',
    border: 'none'
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#3E3D32'
  },
  '.cm-activeLine': {
    backgroundColor: '#3E3D32'
  },
  '.cm-lineNumbers': {
    color: '#75715E'
  }
});

export const mermaidLanguage = [
  mermaidSyntax,
  syntaxHighlighting(monokaiTheme),
  monokaiBackground
];
