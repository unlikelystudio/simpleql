import { DocumentNode } from 'graphql/language/ast'
import { print } from 'graphql'

interface IQueryOptions {
  query: string | DocumentNode
  variables?: object | null
  operationName?: string
  fetch?: {
    headers?: ISimpleQLHeaders
  }
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

interface ObjectParams {
  [key: string]: any
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
    const data = await this.fetch<T>(options, {
      ...this.options,
      headers: {
        ...this.options.headers,
        ...options?.fetch?.headers,
      },
    })

    return data
  }

  async mutation(options: IQueryOptions) {
    const data = await this.fetch(options, {
      ...this.options,
      headers: {
        ...this.options.headers,
        ...options?.fetch?.headers,
      },
    })

    return data
  }

  /**
   * Thanks @budry for your PR https://github.com/prisma-labs/graphql-request/pull/91
   * Not the right solution
   */
  private async processHeaders(
    headers: ISimpleQLHeaders,
  ): Promise<HeadersInit> {
    const h: ISimpleQLHeaders = { ...headers } as DynamicHeaders
    const keys = Object.keys(headers)
    const dynamicHeaders = headers as DynamicHeaders

    if (keys.length > 0 && keys.filter(String).length === keys.length) {
      for (let name in headers) {
        if (typeof dynamicHeaders[name] === 'function') {
          h[name] = await (dynamicHeaders[name] as DynamicHeaderValue)()
        }
      }
    }

    return h as HeadersInit
  }

  private prepareBody(options: IQueryOptions): string {
    options.query = this.graphqlToString(options.query)

    if (typeof options === 'string') return options
    return JSON.stringify(options)
  }

  private async fetch<T>(
    ctx: object | IQueryOptions,
    options: IRequestInit,
  ): Promise<IGraphQLResponse<T>> {
    try {
      const headers = await this.processHeaders({
        ...this.options.headers,
        ...options.headers,
      })

      const res = await fetch(
        this.options.method.toLocaleLowerCase() === 'get'
          ? `${this.url}?${this.encodeURI(ctx)}`
          : this.url,
        {
          ...options,
          ...(this.options.method.toLocaleLowerCase() === 'post'
            ? { body: this.prepareBody(ctx as IQueryOptions) }
            : {}),
          headers,
        },
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

  private encodeURI(params: ObjectParams): string {
    let query = ''
    var key: any
    for (key in params) {
      query += `${encodeURIComponent(key)}=${encodeURIComponent(
        this.encodeURIType(params[key]),
      )}&`
    }

    return query
  }

  private encodeURIType(params: string | DocumentNode): string {
    if (typeof params === 'string') return params
    if (!params.kind) return JSON.stringify(params)

    return this.graphqlToString(params)
  }
}

export default SimpleQL

export type { IQueryOptions, IGraphQLError, IGraphQLResponse }
