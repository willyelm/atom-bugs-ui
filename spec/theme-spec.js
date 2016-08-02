describe('One Dark UI theme', function () {
  
  beforeEach(function () {
    return waitsForPromise(function () {
      return atom.packages.activatePackage('one-dark-ui')
    })
  })

  it('allows the font size to be set via config', function () {
    expect(document.documentElement.style.fontSize).toBe('')
    atom.config.set('one-dark-ui.fontSize', '10')
    expect(document.documentElement.style.fontSize).toBe('10px')
    atom.config.set('one-dark-ui.fontSize', 'Auto')
    return expect(document.documentElement.style.fontSize).toBe('')
  })

  it('allows the layout mode to be set via config', function () {
    expect(document.documentElement.getAttribute('theme-one-dark-ui-layoutmode')).toBe('auto')
    atom.config.set('one-dark-ui.layoutMode', 'Spacious')
    return expect(document.documentElement.getAttribute('theme-one-dark-ui-layoutmode')).toBe('spacious')
  })

  it('allows the tab sizing to be set via config', function () {
    expect(document.documentElement.getAttribute('theme-one-dark-ui-tabsizing')).toBe('auto')
    atom.config.set('one-dark-ui.tabSizing', 'Minimum')
    return expect(document.documentElement.getAttribute('theme-one-dark-ui-tabsizing')).toBe('minimum')
  })
})
