import SimpleQL from '../index'
import { getArtist } from './query.graphql'
import gql from 'graphql-tag'

describe('SimpleQL', () => {
  it('should return correctly datatree', async () => {
    const client = new SimpleQL('https://metaphysics-production.artsy.net')

    const query = await client.query({
      query: getArtist.loc.source.body,
      variables: {},
    })

    expect(query.data).not.toBeNull()
    expect(query).not.toBeNull()
  })

  it('sould return correctly datatree with string query', async () => {
    const client = new SimpleQL('https://metaphysics-production.artsy.net')

    const query = await client.query({
      query: `query getArtist {
        artists(sort: TRENDING_DESC, size: 3) {
          name
          bio
        }
      }
      `,
      variables: {},
    })

    expect(query.data).not.toBeNull()
    expect(query).not.toBeNull()
  })

  it('sould return correctly datatree with gql query', async () => {
    const client = new SimpleQL('https://metaphysics-production.artsy.net')

    const query = await client.query({
      query: gql`
        query getArtist {
          artists(sort: TRENDING_DESC, size: 3) {
            name
            bio
          }
        }
      `,
      variables: {},
    })

    expect(query.data).not.toBeNull()
    expect(query).not.toBeNull()
  })

  it('sould return correctly datatree with gql query and in get', async () => {
    const client = new SimpleQL('https://metaphysics-production.artsy.net', {
      method: 'get',
    })

    const query = await client.query({
      query: gql`
        query getArtist {
          artists(sort: TRENDING_DESC, size: 3) {
            name
            bio
          }
        }
      `,
      variables: {},
    })

    expect(query.data).not.toBeNull()
    expect(query).not.toBeNull()
  })

  it('sould return an error but make a right mutation', async () => {
    const client = new SimpleQL('https://metaphysics-production.artsy.net')

    const query = await client.mutation({
      query: gql`
        mutation {
          saveArtwork(input: { artwork_id: "1" }) {
            artwork {
              id
            }
          }
        }
      `,
      variables: {},
    })

    expect(query.errors).not.toBeNull()
    expect(query).not.toBeNull()
  })
})
