var root = document.documentElement

module.exports = {
  activate(state) {
    atom.config.observe('one-dark-ui.fontSize', function (value) {
      return setFontSize(value)
    })
    atom.config.observe('one-dark-ui.layoutMode', function (value) {
      return setLayoutMode(value)
    })
    return atom.config.observe('one-dark-ui.tabSizing', function (value) {
      return setTabSizing(value)
    })
  },
  deactivate() {
    unsetFontSize()
    unsetLayoutMode()
    unsetTabSizing()
  }
}

function setFontSize (currentFontSize) {
  if (Number.isInteger(currentFontSize)) {
    return root.style.fontSize = currentFontSize + 'px'
  } else if (currentFontSize === 'Auto') {
    return unsetFontSize()
  }
}

function unsetFontSize () {
  return root.style.fontSize = ''
}

function setLayoutMode (layoutMode) {
  return root.setAttribute('theme-one-dark-ui-layoutmode', layoutMode.toLowerCase())
}

function unsetLayoutMode () {
  return root.removeAttribute('theme-one-dark-ui-layoutmode')
}

function setTabSizing (tabSizing) {
  return root.setAttribute('theme-one-dark-ui-tabsizing', tabSizing.toLowerCase())
}

function unsetTabSizing () {
  return root.removeAttribute('theme-one-dark-ui-tabsizing')
}
