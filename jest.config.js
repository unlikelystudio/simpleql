module.exports = {
  preset: 'ts-jest',
  moduleFileExtensions: ['ts', 'js'],
  setupFiles: ["isomorphic-fetch"],
  transform: {
    '\\.(gql|graphql)$': 'jest-transform-graphql',
  },
}
