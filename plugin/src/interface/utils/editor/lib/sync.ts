import * as Y from 'yjs';
import * as monaco from 'monaco-editor';
import * as error from 'lib0/error';
import {createMutex} from 'lib0/mutex';

import type {Awareness} from 'y-protocols/awareness';
import type {mutex} from 'lib0/mutex';

// Simple debug logging
const log = (...args: any[]) => false && console.log('[YJS-Monaco]', ...args);

class RelativeSelection {
  start: Y.RelativePosition;
  end: Y.RelativePosition;
  direction: monaco.SelectionDirection;
  constructor (
    start: Y.RelativePosition,
    end: Y.RelativePosition,
    direction: monaco.SelectionDirection,
  ) {
    this.start = start;
    this.end = end;
    this.direction = direction;
  }
}

const createRelativeSelection = (
  editor: monaco.editor.IStandaloneCodeEditor,
  monacoModel: monaco.editor.ITextModel,
  type: Y.Text,
) => {
  const sel = editor.getSelection();
  if (sel !== null) {
    const startPos = sel.getStartPosition();
    const endPos = sel.getEndPosition();
    const start = Y.createRelativePositionFromTypeIndex(type, monacoModel.getOffsetAt(startPos));
    const end = Y.createRelativePositionFromTypeIndex(type, monacoModel.getOffsetAt(endPos));
    return new RelativeSelection(start, end, sel.getDirection());
  }
  return null
}

const createMonacoSelectionFromRelativeSelection = (
  editor: monaco.editor.IStandaloneCodeEditor,
  type: Y.Text,
  relSel: RelativeSelection,
  doc: Y.Doc,
): null | monaco.Selection => {
  const start = Y.createAbsolutePositionFromRelativePosition(relSel.start, doc);
  const end = Y.createAbsolutePositionFromRelativePosition(relSel.end, doc);
  if (start !== null && end !== null && start.type === type && end.type === type) {
    const model = editor.getModel();
    const startPos = model.getPositionAt(start.index);
    const endPos = model.getPositionAt(end.index);
    return monaco.Selection.createWithDirection(
      startPos.lineNumber,
      startPos.column,
      endPos.lineNumber,
      endPos.column,
      relSel.direction,
    );
  }
  return null;
}

export class MonacoBinding {
  mux: mutex;
  doc: Y.Doc;
  ytext: Y.Text;
  monacoModel: monaco.editor.ITextModel;
  editors: Set<monaco.editor.IStandaloneCodeEditor>;
  awareness: Awareness;

  _savedSelections: Map<monaco.editor.IStandaloneCodeEditor, RelativeSelection>;
  _decorations: Map<any, any>;
  _monacoChangeHandler: any;
  _monacoDisposeHandler: any;
  _beforeTransaction: () => void;
  _rerenderDecorations: () => void;
  _ytextObserver: any;

  constructor (
    awareness: Awareness,
    ytext: Y.Text,
    monacoModel: monaco.editor.ITextModel,
    editors = new Set<monaco.editor.IStandaloneCodeEditor>(),
  ) {
    // Setup
    this.mux = createMutex();
    this.doc = ytext.doc;
    this.ytext = ytext;
    this.editors = editors;
    this.awareness = awareness;
    this.monacoModel = monacoModel;
    this._savedSelections = new Map<monaco.editor.IStandaloneCodeEditor, RelativeSelection>();
    
    log('Initializing MonacoBinding');
    
    // Transactions
    this._beforeTransaction = () => {
      this.mux(() => {
        this._savedSelections = new Map();
        editors.forEach(editor => {
          if (editor.getModel() === monacoModel) {
            const rel = createRelativeSelection(editor, monacoModel, ytext);
            if (rel !== null) {
              this._savedSelections.set(editor, rel);
              log('Saved selection for editor before transaction');
            }
          }
        })
      })
    }
    this.doc.on('beforeAllTransactions', this._beforeTransaction);
  
    // Decorations
    this._decorations = new Map();
    this._rerenderDecorations = () => {
      editors.forEach(editor => {
        if (this.awareness && editor.getModel() === monacoModel) {
          const prev = this._decorations.get(editor) || [];
          const next: Array<monaco.editor.IModelDeltaDecoration> = [];
          this.awareness.getStates().forEach((state, clientID) => {
            if (clientID !== this.doc.clientID
              && state.selection != null
              && state.selection.anchor != null
              && state.selection.head != null) {
              const anchorAbs = Y.createAbsolutePositionFromRelativePosition(state.selection.anchor, this.doc);
              const headAbs = Y.createAbsolutePositionFromRelativePosition(state.selection.head, this.doc);
              if (anchorAbs !== null
                && headAbs !== null
                && anchorAbs.type === ytext
                && headAbs.type === ytext) {
                let start: monaco.Position,
                    end: monaco.Position,
                    afterContentClassName: string,
                    beforeContentClassName: string;
                if (anchorAbs.index < headAbs.index) {
                  start = monacoModel.getPositionAt(anchorAbs.index);
                  end = monacoModel.getPositionAt(headAbs.index);
                  afterContentClassName = 'y-sel-head y-sel-head-' + clientID;
                  beforeContentClassName = null;
                } else {
                  start = monacoModel.getPositionAt(headAbs.index);
                  end = monacoModel.getPositionAt(anchorAbs.index);
                  afterContentClassName = null;
                  beforeContentClassName = 'y-sel-head y-sel-head-' + clientID;
                }
                next.push({
                  range: new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
                  options: {
                    className: 'y-sel y-sel-' + clientID,
                    afterContentClassName,
                    beforeContentClassName,
                  },
                });
                log('Added decoration for client', clientID);
              }
            }
          });
          this._decorations.set(editor, editor.deltaDecorations(prev, next));
          log('Updated decorations');
        } else {
          this._decorations.delete(editor);
        }
      })
    }
  
    // YText Observer
    this._ytextObserver = (event: Y.YTextEvent) => {
      log('YText change event received:', { delta: event.delta.length });
      
      this.mux(() => {
        let index = 0;
        event.delta.forEach(op => {
          if (op.retain !== undefined) {
            index += op.retain;
            log('YText retain operation', { length: op.retain, index });
          } else if (op.insert !== undefined) {
            const pos = monacoModel.getPositionAt(index);
            const range = new monaco.Selection(pos.lineNumber, pos.column, pos.lineNumber, pos.column);
            const insert = (op.insert) as string;
            
            log('YText insert operation', { 
              pos: { line: pos.lineNumber, col: pos.column },
              text: insert.length > 20 ? `${insert.substring(0, 20)}...` : insert,
              length: insert.length,
              index
            });
            
            monacoModel.applyEdits([{range, text: insert}]);
            index += insert.length;
          } else if (op.delete !== undefined) {
            const pos = monacoModel.getPositionAt(index);
            const endPos = monacoModel.getPositionAt(index + op.delete);
            const range = new monaco.Selection(pos.lineNumber, pos.column, endPos.lineNumber, endPos.column);
            
            log('YText delete operation', { 
              startPos: { line: pos.lineNumber, col: pos.column },
              endPos: { line: endPos.lineNumber, col: endPos.column },
              deleteCount: op.delete,
              index 
            });
            
            monacoModel.applyEdits([{range, text: ''}]);
          } else {
            throw error.unexpectedCase();
          }
        });
        
        this._savedSelections.forEach((rsel, editor) => {
          const sel = createMonacoSelectionFromRelativeSelection(editor, ytext, rsel, this.doc);
          if (sel !== null) {
            editor.setSelection(sel);
            log('Restored selection after YText change');
          }
        });
      });
      this._rerenderDecorations();
    }
    ytext.observe(this._ytextObserver);
    
    // Initial synchronization: Apply YText content to Monaco if they differ
    {
      const ytextValue = ytext.toString();
      const monacoValue = monacoModel.getValue();
      
      if (monacoValue !== ytextValue) {
        log('Initial synchronization: values differ', {
          ytextLength: ytextValue.length,
          monacoLength: monacoValue.length
        });
        
        // Instead of setValue, we'll apply targeted edits
        try {
          // Create a diff/edit to apply only what has changed
          // For simplicity, we'll replace the entire content in a single edit operation
          // A more sophisticated implementation would compute actual diffs
          const range = new monaco.Range(
            1, 1,
            monacoModel.getLineCount(), 
            monacoModel.getLineMaxColumn(monacoModel.getLineCount())
          );
          
          log('Applying initial edit operation', {
            range: {
              startLine: 1,
              startColumn: 1,
              endLine: monacoModel.getLineCount(),
              endColumn: monacoModel.getLineMaxColumn(monacoModel.getLineCount())
            },
            textLength: ytextValue.length
          });
          
          monacoModel.pushEditOperations(
            [], 
            [{
              range: range,
              text: ytextValue,
              forceMoveMarkers: true,
            }],
            () => null
          );
          
          log('Successfully applied initial edit operation');
        } catch (err) {
          // Fallback to setValue only if the edit operations fail
          console.error('Failed to apply edit operations, falling back to setValue', err);
          monacoModel.setValue(ytextValue);
        }
      } else {
        log('Initial synchronization: values match, no sync needed');
      }
    }
  
    // Editor Change Handler
    // (apply changes from right to left)
    this._monacoChangeHandler = monacoModel.onDidChangeContent(event => {
      log('Monaco change event received', { 
        changes: event.changes.length,
        changes_detail: event.changes.map(c => ({
          rangeOffset: c.rangeOffset,
          rangeLength: c.rangeLength,
          textLength: c.text.length
        }))
      });
      
      this.mux(() => {
        this.doc.transact(() => {
          event.changes.sort((change1, change2) =>
            change2.rangeOffset - change1.rangeOffset).forEach(change => {
              log('Processing Monaco change', { 
                rangeOffset: change.rangeOffset,
                rangeLength: change.rangeLength,
                text: change.text.length > 20 ? `${change.text.substring(0, 20)}...` : change.text
              });
              
              ytext.delete(change.rangeOffset, change.rangeLength);
              ytext.insert(change.rangeOffset, change.text);
            });
        }, this);
      });
    });
  
    // Editor Dispose Handler
    this._monacoDisposeHandler = monacoModel.onWillDispose(() => {
      log('Monaco model is being disposed, destroying binding');
      this.destroy();
    });
  
    // Selection Awareness
    if (this.awareness) {
      editors.forEach(editor => {
        editor.onDidChangeCursorSelection(() => {
          if (editor.getModel() === monacoModel) {
            const sel = editor.getSelection();
            if (sel === null) {
              return;
            }
            let anchor = monacoModel.getOffsetAt(sel.getStartPosition());
            let head = monacoModel.getOffsetAt(sel.getEndPosition());
            if (sel.getDirection() === monaco.SelectionDirection.RTL) {
              const tmp = anchor;
              anchor = head;
              head = tmp;
            }
            
            log('Selection changed', {
              anchor,
              head,
              direction: sel.getDirection()
            });
            
            this.awareness.setLocalStateField('selection', {
              anchor: Y.createRelativePositionFromTypeIndex(ytext, anchor),
              head: Y.createRelativePositionFromTypeIndex(ytext, head),
            });
          }
        })
        this.awareness.on('change', this._rerenderDecorations);
      })
    }
    
    log('MonacoBinding initialization complete');
  }

  destroy () {
    log('Destroying MonacoBinding');
    this._monacoChangeHandler.dispose();
    this._monacoDisposeHandler.dispose();
    this.ytext.unobserve(this._ytextObserver);
    this.doc.off('beforeAllTransactions', this._beforeTransaction);
    if (this.awareness) {
      this.awareness.off('change', this._rerenderDecorations);
    }
  }
}
