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

interface IGraphQLResponse {
  data?: any
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

  async query(options: IQueryOptions): Promise<IGraphQLResponse> {
    this.transformOptions(options)

    const data = await this.fetch({
      ...this.options,
    })

    return data
  }

  async mutation(options: IQueryOptions) {
    this.transformOptions(options)

    const data = await this.fetch({
      ...this.options,
    })

    return data
  }

  /**
   * Thanks @budry for your PR https://github.com/prisma-labs/graphql-request/pull/91
   */
  private async processHeaders(
    headers: ISimpleQLHeaders
  ): Promise<HeadersInit> {
    for (let name in headers) {
      if (typeof headers[name] === 'function') {
        headers[name] = await (headers[name] as DynamicHeaderValue)()
      }
    }
    return headers as HeadersInit
  }

  private transformOptions(options: IQueryOptions) {
    if (this.options.method.toLocaleLowerCase() === 'post') {
      this.setBody(this.prepareBody(options))
    } else {
      this.setUrl(`${this.url}?${this.encodeURI(options)}`)
    }

    return options
  }

  private prepareBody(options: IQueryOptions): string {
    options.query = this.graphqlToString(options.query)

    if (typeof options === 'string') return options
    return JSON.stringify(options)
  }

  private async fetch(options: IRequestInit): Promise<IGraphQLResponse> {
    try {
      const headers = await this.processHeaders(this.options.headers)

      const res = await fetch(this.url, {
        ...options,
        headers,
      })
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
    if (typeof query !== 'string') return print(<DocumentNode>query)
    return query
  }

  private setUrl(url: string): void {
    this.url = url
  }

  private setBody(body: string): void {
    this.options.body = body
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
