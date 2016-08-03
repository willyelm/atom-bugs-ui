/* global atom */
'use strict'

const Bugs = require('./bugs')
const CompositeDisposable = require('atom').CompositeDisposable

function BugsView () {
  // subscriptions
  this.subscriptions = new CompositeDisposable()
  // panel
  this.panel = document.createElement('atom-bugs-panel')
  // group button
  let groupButton = document.createElement('div')
  groupButton.className = 'btn-group btn-toggle btn-group-options'
  this.panel.appendChild(groupButton)
  // output
  this.output = document.createElement('pre')
  this.panel.appendChild(this.output)
  // run button
  let runButton = document.createElement('button')
  let runIcon = document.createElement('span')

  runButton.className = 'btn'
  runIcon.className = 'icon icon-triangle-right'
  runButton.appendChild(runIcon)
  runButton.addEventListener('click', () => {
    this.destroy()
    this.output.innerHTML = ''
    let editor = atom.workspace.getActiveTextEditor()
    let filePath = editor.getPath()
    this.task = new Bugs({
      fileName: filePath
    })
    this
      .task
      .start((text) => {
        let line = document.createElement('div')
        line.innerHTML = text
        this.output.appendChild(line)
      })
      .then(() => {
        return this.task.setBreakpoint({
          target: filePath,
          line: 2
        })
      })
      .then(() => {
        return this.task.cont()
      })
      .then((cont) => {
        return this.task.backtrace()
      })
      .then((trace) => {
        trace.frames.forEach((frame) => {
          let line = document.createElement('div')
          line.innerHTML = `${frame.script.name}:${frame.func.line} <strong>${frame.func.name || frame.func.inferredName}()</strong>`
          this.output.appendChild(line)
        })
      })
  })
  this.subscriptions.add(atom.tooltips.add(runButton, {
    title: 'Debug',
    placement: 'right'
  }))
  groupButton.appendChild(runButton)
  // breakpoints
  this.breakpoints = []
  return (this)
}

BugsView.prototype = Object.create({}, {
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
  removeBreakWithIndex: {
    value (index) {
      if (index >= 0) {
        this.breakpoints.splice(index, 1)
      }
    }
  }
})

module.exports = BugsView
