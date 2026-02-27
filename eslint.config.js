import schplitt from '@schplitt/eslint-config'

export default schplitt({
  ignores: ['dist', 'build', 'coverage', 'node_modules', '.output', '.wrangler'],
}).overrideRules({
  'no-console': 'off',
})
