import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { indentUnit } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'

const extensions = [python(), indentUnit.of('    '), EditorView.lineWrapping]

/**
 * Éditeur Python « conditions d'examen » : coloration syntaxique,
 * mais ni autocomplétion, ni fermeture automatique des parenthèses.
 */
export function CodeEditor({
  value,
  onChange,
  readOnly,
  minHeight = '320px',
  maxHeight,
}: {
  value: string
  onChange?: (v: string) => void
  readOnly?: boolean
  minHeight?: string
  maxHeight?: string
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <CodeMirror
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        editable={!readOnly}
        theme={vscodeDark}
        extensions={extensions}
        minHeight={minHeight}
        maxHeight={maxHeight}
        indentWithTab
        basicSetup={{
          autocompletion: false,
          closeBrackets: false,
          completionKeymap: false,
          lintKeymap: false,
          highlightActiveLine: !readOnly,
          highlightActiveLineGutter: !readOnly,
          foldGutter: false,
          searchKeymap: false,
        }}
      />
    </div>
  )
}
