import schplitt from '@schplitt/eslint-config'

export default schplitt({
  ignores: ['dist', 'build', 'coverage', 'node_modules', '.output', '.wrangler', '.clank8y'],
}).overrideRules({
  'no-console': 'off',
})
