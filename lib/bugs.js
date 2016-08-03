'use strict'
// const net = require('net')
// const log = require('console')
const Debugger = require('_debugger')
const spawn = require('child_process').spawn

function Bugs (settings) {
  this.settings = {}
  Object.assign(this.settings, {
    fileName: '',
    hostname: 'localhost',
    port: 5800
  }, settings)
  // debugger
  this.client = new Debugger.Client()
  this.protocol = new Debugger.Protocol()
  this.connectionAttempts = 0
}

Bugs.prototype = Object.create({}, {
  // Run and connect
  start: {
    value (output) {
      return this
        .run(output)
        .then(() => {
          return new Promise((resolve, reject) => {
            this.resolver = resolve
            this.rejecter = reject
            this.retry()
          })
        })
    }
  },
  // Run script
  run: {
    value (cb) {
      return new Promise((resolve, reject) => {
        let args = [
          `--debug-brk=${this.settings.port}`,
          this.settings.fileName
        ]
        this.childTask = spawn('node', args)

        this.childTask.stdout.on('data', (data) => cb)
        this.childTask.stderr.on('data', (data) => cb)
        this.childTask.stdout.on('end', (data) => console.log('task(end): out'))
        this.childTask.stderr.on('end', (data) => console.log('task(end): err'))
        this.childTask.on('exit', () => {
          this.client.destroy()
        })
        resolve(this.childTask)
      })
    }
  },
  // Retry connection
  retry: {
    value () {
      this.connectionAttempts++
      if (this.connectionAttempts >= 10) {
        this.rejecter('failed to connect debugger')
      } else {
        this.client.connect(this.settings.port, this.settings.hostname)
        this.client.once('ready', () => this.resolver(this.client))
        this.client.on('error', (e) => {
          setTimeout(() => {
            this.retry()
          }, 500)
        })
      }
    }
  },
  // Task: step
  step: {
    value (type, count) {
      return new Promise((resolve, reject) => {
        this.client.step(type, count, (err, res) => {
          if (err) return reject(err)
          resolve(res)
        })
      })
    }
  },
  // Task: continue
  cont: {
    value () {
      return new Promise((resolve, reject) => {
        this.client.reqContinue((err, res) => {
          if (err) return reject(err)
          resolve(res)
        })
      })
    }
  },
  // Task: backtrace
  backtrace: {
    value () {
      return new Promise((resolve, reject) => {
        this.client.fullTrace((err, res) => {
          if (err) return reject(err)
          resolve(res)
        })
      })
    }
  },
  // Task: scope
  scope: {
    value (args) {
      return new Promise((resolve, reject) => {
        this.client.req({
          command: 'scope',
          arguments: args
        }, (err, res) => {
          if (err) return reject(err)
          resolve(res)
        })
      })
    }
  },
  // Task: evaluate
  evaluate: {
    value (expression) {
      return new Promise((resolve, reject) => {
        this.client.reqFrameEval(expression, 0, (err, res) => {
          if (err) return reject(err)
          resolve(res)
        })
      })
    }
  },
  // Task: evaluate
  setBreakpoint: {
    value ({target, line, condition}) {
      return new Promise((resolve, reject) => {
        this.client.setBreakpoint({
          type: 'script',
          target: target,
          line: line,
          condition: condition
        }, (err, res) => {
          if (err) return reject(err)
          resolve(res)
        })
      })
    }
  }
})

module.exports = Bugs
