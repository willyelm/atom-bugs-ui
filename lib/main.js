/* global atom */
'use strict'

const path = require('path')
const root = document.documentElement
const BugsView = require('./bugs-view.js')

module.exports = {
  debugView: new BugsView(),
  activate (state) {
    // attaching element
    let panelView = atom.workspace.addTopPanel({
      item: this.debugView.panel,
      visible: false
    })
    // toggle debug bar
    atom.workspace.observeActivePaneItem((editor) => {
      if (editor && editor.getPath) {
        let ext = path.extname(editor.getPath())
        // activate for javascript files only
        if (['.js'].indexOf(ext) >= 0) {
          panelView.show()
        } else {
          panelView.hide()
        }
      }
    })
    // toggle breakpoint manager
    atom.workspace.observeTextEditors((editor) => {
      editor
        .editorElement
        .shadowRoot
        .addEventListener('click', (e) => {
          if (e.target.classList.contains('line-number')) {
            let sourceFile = editor.getPath()
            let lineNumber = Number(e.target.textContent)
            let currentIndex = this.debugView.indexBreak(sourceFile, lineNumber)
            if (currentIndex >= 0) {
              this.debugView.removeBreakWithIndex(currentIndex)
              let breakpoint = e.target.querySelector('.atom-bugs-breakpoint')
              e.target.removeChild(breakpoint)
            } else {
              this.debugView.addBreak(sourceFile, lineNumber)
              let breakpoint = document.createElement('div')
              breakpoint.className = 'atom-bugs-breakpoint'
              e.target.appendChild(breakpoint)
            }
          }
        })
    })
    // Theme
    atom.config.observe('atom-bugs-ui.fontSize', function (value) {
      if (Number.isInteger(value)) {
        root.style.fontSize = value + 'px'
      } else if (value === 'Auto') {
        root.style.fontSize = ''
      }
      return root.style.fontSize
    })
    atom.config.observe('atom-bugs-ui.layoutMode', function (value) {
      root.setAttribute('theme-atom-bugs-ui-layoutmode', value.toLowerCase())
    })
    return atom.config.observe('atom-bugs-ui.tabSizing', function (value) {
      root.setAttribute('theme-atom-bugs-ui-tabsizing', value.toLowerCase())
    })
  },
  deactivate () {
    root.style.fontSize = ''
    root.removeAttribute('theme-atom-bugs-ui-layoutmode')
    root.removeAttribute('theme-atom-bugs-ui-tabsizing')
    this.debugView.destroy()
  }
}
