module.exports = {
  preset: 'ts-jest',
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '\\.(gql|graphql)$': 'jest-transform-graphql',
  },
}
