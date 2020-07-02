import SimpleQL from '../index'
import { getArtist } from './query.graphql'
import gql from 'graphql-tag'

describe('SimpleQL', () => {
  it('should return correctly datatree', async () => {
    const client = new SimpleQL('https://metaphysics-production.artsy.net/?')

    const query = await client.query({
      query: getArtist.loc.source.body,
      variables: {},
    })

    expect(query.data).not.toBeNull()
    expect(query).not.toBeNull()
  })

  it('sould return correctly datatree with string query', async () => {
    const client = new SimpleQL('https://metaphysics-production.artsy.net/?')

    const query = await client.query({
      query: `query getArtist {
        artists(sort: TRENDING_DESC, size: 3) {
          name
        }
      }
      `,
      variables: {},
    })

    expect(query.data).not.toBeNull()
    expect(query).not.toBeNull()
  })
  it('sould return correctly datatree with gql query', async () => {
    const client = new SimpleQL('https://metaphysics-production.artsy.net/?')

    const query = await client.query({
      query: gql`
        query getArtist {
          artists(sort: TRENDING_DESC, size: 3) {
            name
          }
        }
      `,
      variables: {},
    })

    expect(query.data).not.toBeNull()
    expect(query).not.toBeNull()
  })
})
