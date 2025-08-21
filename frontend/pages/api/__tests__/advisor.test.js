import test from 'node:test'
import assert from 'node:assert/strict'
import handler, { MAX_MESSAGE_LENGTH } from '../advisor.js'

function createRes() {
  return {
    statusCode: 0,
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(data) {
      this.body = data
      return this
    }
  }
}

test('responds 400 when message is empty', async () => {
  const req = { method: 'POST', body: { message: '' } }
  const res = createRes()
  await handler(req, res)
  assert.equal(res.statusCode, 400)
})

test('responds 400 when message exceeds max length', async () => {
  const req = { method: 'POST', body: { message: 'a'.repeat(MAX_MESSAGE_LENGTH + 1) } }
  const res = createRes()
  await handler(req, res)
  assert.equal(res.statusCode, 400)
})
