<p align="center">
  <h1 align="center">SimpleQL</h1>
</p>

<p align="center">
  <img src="https://github.com/unlikelystudio/simpleql/workflows/Test/badge.svg">
  <img src="https://badge.fury.io/js/%40unlikelystudio%2Fsimpleql.svg" alt="npm version" height="18">
</p>

<p align="center">
  <strong>Minimal graphql client</strong>
  <br />
</p>

_Inspired by [graphql-request](https://github.com/prisma-labs/graphql-request) by Prisma._

## Getting started

```bash

npm i @unlikelystudio/simpleql

```

```typescript
import SimpleQL from '@unlikelystudio/simpleql'
import gql from 'graphql-tag'

const client = new SimpleQL('https://api.unlikely.studio')

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

// OR

const query = gql`
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
