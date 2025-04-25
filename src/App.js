import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Icon } from '@iconify/react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { mermaidLanguage } from './mermaidLanguage';
import './App.css';

function App() {
  const editorRef = useRef(null);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0 });

  const formatMermaidCode = () => {
    try {
      const lines = diagram.split('\n').map(line => line.trim()).filter(line => line);
      let indentLevel = 0;
      const indentSize = 2;
      
      const formatted = lines.map(line => {
        // Decrease indent for end statements
        if (line.match(/^end\b/)) {
          indentLevel = Math.max(0, indentLevel - 1);
        }
        
        // Add current indentation
        const currentIndent = ' '.repeat(indentLevel * indentSize);
        const formattedLine = currentIndent + line;
        
        // Increase indent after subgraph or group statements
        if (line.match(/^(subgraph|group)\b/)) {
          indentLevel++;
        }
        
        return formattedLine;
      }).join('\n');
      
      setDiagram(formatted);
    } catch (error) {
      console.error('Error formatting code:', error);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleClick = () => {
    setContextMenu({ show: false, x: 0, y: 0 });
  };

  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  mermaid.registerIconPacks([
    {
      name: 'logos',
      loader: () => import('@iconify-json/logos').then((module) => module.icons),
    },
  ]);

  const [diagram, setDiagram] = useState(`
   architecture-beta
    group api(logos:aws-ecs)[Angular App]
    service db(logos:aws-elb)[Database] in api
    service disk1(disk)[Storage] in api
    service disk2(disk)[Storage] in api
    service server(server)[Server] in api
    db:L -- R:server
    disk1:T -- B:server
    disk2:T -- B:db
  `);

  const [svg, setSvg] = useState('');

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
    });
  }, []);

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        const { svg } = await mermaid.render('mermaid-diagram', diagram);
        setSvg(svg);
      } catch (error) {
        console.error('Failed to render diagram:', error);
      }
    };

    renderDiagram();
  }, [diagram]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>
          <Icon icon="logos:mermaid" className="logo" /> Mermaid Chart Editor
        </h1>
      </header>
      <main>
        <div className="editor-container">
          <div
            ref={editorRef}
            onContextMenu={handleContextMenu}
          >
            <CodeMirror
            value={diagram}
            height="900px"
            theme={oneDark}
            extensions={[mermaidLanguage]}
            onChange={(value) => setDiagram(value)}
            placeholder="Enter your Mermaid diagram code here..."
            className="diagram-input"
            basicSetup={{
              lineNumbers: true,
              highlightActiveLineGutter: true,
              highlightSpecialChars: true,
              foldGutter: true,
              drawSelection: true,
              dropCursor: true,
              allowMultipleSelections: true,
              indentOnInput: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: true,
              rectangularSelection: true,
              crosshairCursor: true,
              highlightActiveLine: true,
              highlightSelectionMatches: true,
              closeBracketsKeymap: true,
              defaultKeymap: true,
              searchKeymap: true,
              historyKeymap: true,
              foldKeymap: true,
              completionKeymap: true,
              lintKeymap: true,
            }}
            />
          </div>
          <div
            className="diagram-output"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          {contextMenu.show && (
            <div
              className="context-menu"
              style={{
                position: 'fixed',
                top: contextMenu.y,
                left: contextMenu.x,
              }}
            >
              <button onClick={formatMermaidCode}>Format Code</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
