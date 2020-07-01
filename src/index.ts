import fetch from 'cross-fetch'

interface IQueryOptions {
  query: string
  variables?: object | null
  operationName?: string
}

export interface IGraphQLError {
  message: string
  locations: { line: number; column: number }[]
  path: string[]
  [key: string]: any
}

interface IGraphQLResponse {
  data?: any
  errors?: IGraphQLError[]
  extensions?: any
  status: number
  [key: string]: any
}

class SimpleQL {
  private url: string
  private options: RequestInit

  constructor(url: string, options?: RequestInit) {
    this.url = url
    this.options = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      ...options,
    }
  }

  async query(options: IQueryOptions): Promise<IGraphQLResponse> {
    const data = await this.fetch({
      ...this.options,
      body: this.prepareBody(options),
    })

    return data
  }

  private prepareBody(body: string | object): string {
    if (typeof body === 'string') return body
    return JSON.stringify(body)
  }

  private async fetch(options: RequestInit): Promise<IGraphQLResponse> {
    try {
      const res = await fetch(this.url, options)
      if (res.status >= 400) {
        console.log(await res.text())
        throw new Error('an error happen')
      }

      const data = await res.json()

      return data
    } catch (error) {
      console.log(error)
    }
  }
}

export default SimpleQL
