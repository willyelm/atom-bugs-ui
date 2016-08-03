/* global atom */
'use strict'

const root = document.documentElement
const BugsView = require('./bugs-view.js')

module.exports = {
  debugView: new BugsView(),
  activate (state) {
    // attaching element
    this.debugView.attachPanel()
    // toggle breakpoint manager
    this.debugView.attachBreakpoints()
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
