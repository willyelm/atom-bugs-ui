/* global atom */
'use strict'

const path = require('path')
const Bugs = require('./bugs')
const CompositeDisposable = require('atom').CompositeDisposable

function BugsView () {
  // subscriptions
  this.subscriptions = new CompositeDisposable()
  // panel
  this.panel = document.createElement('atom-bugs-panel')
  // group button
  this.controls = document.createElement('div')
  this.controls.className = 'btn-group btn-toggle btn-group-options'
  this.panel.appendChild(this.controls)
  // output
  this.output = document.createElement('pre')
  this.output.className = 'native-key-bindings'
  this.output.setAttribute('tabindex', -1)
  this.panel.appendChild(this.output)
  // run button
  let runButton = this.addButton({
    icon: 'icon-triangle-right',
    tooltip: 'Start Debug',
    action () {
      runButton.disabled = true
      this.destroy()
      this.output.innerHTML = ''
      let editor = atom.workspace.getActiveTextEditor()
      let filePath = editor.getPath()
      this.task = new Bugs({
        fileName: filePath
      })
      this
        .task
        .start((output) => {
          this.addMessage(output)
        }, () => {
          console.log('completed...')
          runButton.disabled = false
        })
        .then(() => {
          let promises = this.breakpoints.map((breakpoint) => {
            return this.task.setBreakpoint({
              target: breakpoint.target,
              line: (breakpoint.line - 1) // debugger line starts on #0
            })
          })
          return Promise.all(promises)
        })
        .then(() => {
          return this.task.cont()
        })
        // .then((cont) => {
        //   return this.task.backtrace()
        // })
        // .then((trace) => {
        //   trace.frames.forEach((frame) => {
        //     let line = document.createElement('div')
        //     line.innerHTML = `${frame.script.name}:${frame.func.line} <strong>${frame.func.name || frame.func.inferredName}()</strong>`
        //     this.output.appendChild(line)
        //   })
        // })
        .catch((message) => {
          atom.notifications.addError('Atom Bugs', {
            detail: `Debugger cannot start script: ${message}`,
            icon: 'flame'
          })
        })
    }
  })
  // breakpoints
  this.breakpoints = []
  return (this)
}

BugsView.prototype = Object.create({}, {
  attachPanel: {
    value () {
      let panelView = atom.workspace.addTopPanel({
        item: this.panel,
        visible: false
      })
      // panelView.attr('tabindex', -1)
      // console.log()
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
    }
  },
  attachBreakpoints: {
    value () {
      atom.workspace.observeTextEditors((editor) => {
        editor
          .editorElement
          .shadowRoot
          .addEventListener('click', (e) => {
            let element = e.target
            let isBreakpoint = element.classList.contains('atom-bugs-breakpoint')
            if (isBreakpoint) {
              element = e.target.parentNode
            }

            if (element.classList.contains('line-number')) {
              let lineNumber = Number(element.textContent)
              let sourceFile = editor.getPath()
              let currentIndex = this.indexBreak(sourceFile, lineNumber)
              if (currentIndex >= 0) {
                this.removeBreakWithIndex(currentIndex)
                let breakpoint = element.querySelector('.atom-bugs-breakpoint')
                if (breakpoint) {
                  element.removeChild(breakpoint)
                }
              } else {
                this.addBreak(sourceFile, lineNumber)
                let breakpoint = document.createElement('div')
                breakpoint.className = 'atom-bugs-breakpoint'
                element.appendChild(breakpoint)
              }
            }
          })
      })
    }
  },
  show: {
    value () {
      this.panelView.show()
    }
  },
  hide: {
    value () {
      this.panelView.hide()
    }
  },
  destroy: {
    value () {
      if (this.task && this.task.client) {
        this.task.client.destroy()
      }
      if (this.task && this.task.childTask) {
        this.task.childTask.kill()
      }
      this.subscriptions.dispose()
    }
  },
  indexBreak: {
    value (filePath, lineNumber) {
      return this.breakpoints.findIndex((item) => {
        return (item.target === filePath && item.line === lineNumber)
      })
    }
  },
  addBreak: {
    value (filePath, lineNumber) {
      this.breakpoints.push({
        target: filePath,
        line: lineNumber
      })
    }
  },
  addMessage: {
    value (text) {
      let line = document.createElement('div')
      line.innerHTML = `${text || '&nbsp;'}`
      this.output.appendChild(line)
    }
  },
  addButton: {
    value (options) {
      let button = document.createElement('button')
      let buttonIcon = document.createElement('span')
      button.className = 'btn'
      buttonIcon.className = `icon ${options.icon}`
      button.appendChild(buttonIcon)
      button.addEventListener('click', options.action.bind(this))
      this.controls.appendChild(button)
      this.subscriptions.add(atom.tooltips.add(button, {
        title: options.tooltip,
        placement: 'bottom'
      }))
      return button
    }
  },
  removeBreakWithIndex: {
    value (index) {
      if (index >= 0) {
        this.breakpoints.splice(index, 1)
      }
    }
  }
})

module.exports = BugsView
