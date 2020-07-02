<p align="center">
  <h1 align="center">SimpleQL</h1>
</p>

<p align="center">
  <img src="https://github.com/unlikelystudio/simpleql/workflows/Test/badge.svg">
</p>

<p align="center">
  <strong>Minimal graphql client</strong>
  <br />
</p>

## Getting started

```bash

npm i simpleql

```

```typescript
import SimpleQL from 'simpleql'

const client = new SimpleQL({
  url: 'https://api.unlikely.studio',
})

const query = `
  query Projects {
    projects(first: 3) {
      edges {
        node {
          title
          description
          image {
            src
            width
            height
          }
        }
      }
    }
  }
`

const query = await client.query({
  query,
})
```
