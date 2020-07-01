import SimpleQL from '../index'
import { getArtist } from './query.graphql'

describe('SimpleQL', () => {
  it('should return correctly datathree', async () => {
    const client = new SimpleQL('https://metaphysics-production.artsy.net/?')

    const query = await client.query({
      query: getArtist.loc.source.body,
      variables: {},
    })

    expect(query.data).not.toBeNull()
    expect(query).not.toBeNull()
  })
})
