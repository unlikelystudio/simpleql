import fetch from 'cross-fetch'
import { DocumentNode, print } from 'graphql'

interface IQueryOptions {
  query: string | DocumentNode
  variables?: object | null
  operationName?: string
}

interface IGraphQLError {
  message: string
  locations: { line: number; column: number }[]
  path: string[]
  [key: string]: any
}

interface IGraphQLResponse<T> {
  data?: T
  errors?: IGraphQLError[]
  extensions?: any
  status: number
  [key: string]: any
}

interface DynamicHeaderValue {
  (): string | DynamicHeaderValue
}

interface DynamicHeaders {
  [key: string]: string | DynamicHeaderValue
}

type ISimpleQLHeaders = HeadersInit | DynamicHeaders

interface IRequestInit extends Omit<RequestInit, 'headers'> {
  headers?: ISimpleQLHeaders
}

class SimpleQL {
  private url: string
  private options: IRequestInit

  constructor(url: string, options?: IRequestInit) {
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

  async query<T>(options: IQueryOptions): Promise<IGraphQLResponse<T>> {
    const data = await this.fetch(options, {
      ...this.options,
    })

    return data
  }

  async mutation(options: IQueryOptions) {
    const data = await this.fetch(options, {
      ...this.options,
    })

    return data
  }

  /**
   * Thanks @budry for your PR https://github.com/prisma-labs/graphql-request/pull/91
   * Not the right solution
   */
  private async processHeaders(
    headers: ISimpleQLHeaders
  ): Promise<HeadersInit> {
    const h: ISimpleQLHeaders = { ...headers }
    for (let name in headers) {
      if (typeof headers[name] === 'function') {
        h[name] = await (headers[name] as DynamicHeaderValue)()
      }
    }

    return h as HeadersInit
  }

  private prepareBody(options: IQueryOptions): string {
    options.query = this.graphqlToString(options.query)

    if (typeof options === 'string') return options
    return JSON.stringify(options)
  }

  private async fetch(ctx, options: IRequestInit): Promise<IGraphQLResponse> {
    try {
      const headers = await this.processHeaders(this.options.headers)

      const res = await fetch(
        this.options.method.toLocaleLowerCase() === 'get'
          ? `${this.url}?${this.encodeURI(ctx)}`
          : this.url,
        {
          ...options,
          ...(this.options.method.toLocaleLowerCase() === 'post'
            ? { body: this.prepareBody(ctx) }
            : {}),
          headers,
        }
      )
      if (res.status >= 400) {
        const error = await res.text()
        throw new Error(error)
      }

      const data = await res.json()

      return data
    } catch (error) {
      throw new Error(error)
    }
  }

  private graphqlToString(query: string | DocumentNode): string {
    if (typeof query !== 'string')
      return this.stripQueryString(print(<DocumentNode>query))
    return this.stripQueryString(query)
  }

  /**
   * https://github.com/bwlt/gatsby-source-prismic-graphql/blob/8fcec72add1b3d4606ec8be27e51cce4a8f81156/packages/gatsby-source-prismic-graphql/src/utils/index.ts#L44-L53
   * @param query
   */
  private stripQueryString(query: string): string {
    return query
      .replace(/\#.*\n/g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s?\{\s?/g, '{')
      .replace(/\s?\}\s?/g, '}')
      .replace(/\s?\:\s?/g, ':')
      .replace(/\s?\(\s?/g, '(')
      .replace(/\s?\)\s?/g, ')')
      .replace(/\.\.\.\s/g, '...')
      .replace(/\,\s/g, ',')
  }

  private encodeURI(params: object): string {
    let query = ''
    var key: any
    for (key in params) {
      query += `${encodeURIComponent(key)}=${encodeURIComponent(
        this.encodeURIType(params[key])
      )}&`
    }

    return query
  }

  private encodeURIType(params: string | DocumentNode | any): string {
    if (typeof params === 'string') return params
    if (!params.kind) return JSON.stringify(params)

    return this.graphqlToString(params)
  }
}

export default SimpleQL

export { IQueryOptions, IGraphQLError, IGraphQLResponse }
