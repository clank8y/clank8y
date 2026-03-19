import schplitt from '@schplitt/eslint-config'

export default schplitt({
  ignores: ['dist', 'build', 'coverage', 'node_modules', '.output', '.wrangler', '.clank8y', '.action'],
}).overrideRules({
  'no-console': 'off',
})
