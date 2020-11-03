import SimpleQL from '../index'
//@ts-ignore
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

  it('should return correctly datatree with string query', async () => {
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

  it('should return correctly datatree with gql query', async () => {
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

  it('should return correctly datatree with gql query and in get', async () => {
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
})
