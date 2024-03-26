/* eslint-disable @typescript-eslint/consistent-type-definitions */

/**
 * Basic JSON response for Controllers
 */
export type BasicResponse = {
  message: string
}

export type ErrorResponse = {
  error: string
  message: string
}
