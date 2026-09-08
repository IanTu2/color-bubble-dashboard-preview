import assert from 'node:assert/strict'
import { loadTodos } from '../src/services/todos.ts'

function mockClient(results) {
  const calls = []
  return {
    calls,
    from(table) {
      assert.equal(table, 'todos')
      return {
        select(fields) {
          calls.push(fields)
          return { eq(column, value) {
            assert.equal(column, 'user_id')
            assert.equal(value, 'test-user')
            return { order() { return Promise.resolve(results[calls.length - 1]) } }
          } }
        },
      }
    },
  }
}
const ok = { data: [{id: '1', title: 'Example', completed: false}], error: null }
const missing = { data: null, error: { code: '42703', message: 'column does not exist' } }
for (const [results, expectedCalls, expectedSchema] of [
  [[ok], 1, 'schedule'],
  [[missing, ok], 2, 'extended'],
  [[missing, missing, ok], 3, 'legacy'],
  [[{ data: null, error: { code: 'PGRST204', message: 'missing column in schema cache' } }, ok], 2, 'extended'],
]) {
  const client = mockClient(results)
  const result = await loadTodos(client, 'test-user')
  assert.equal(client.calls.length, expectedCalls)
  assert.equal(result.schemaMode, expectedSchema)
  assert.equal(result.error, null)
  assert.equal(result.todos[0].title, 'Example')
}
for (const code of ['42501', 'PGRST301', '', '42P01']) {
  const error = {code, message: 'Original error must be preserved'}
  for (const prefix of [[], [missing]]) {
    const client = mockClient([...prefix, {data: null, error}])
    const result = await loadTodos(client, 'test-user')
    assert.equal(client.calls.length, prefix.length + 1)
    assert.equal(result.error, error)
    assert.deepEqual(result.todos, [])
  }
}
console.log('PASS: schema compatibility retained; network/auth/policy/missing-table errors are not retried or masked (12 cases).')
