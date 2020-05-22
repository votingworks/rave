import { Election } from '@votingworks/ballot-encoder'
import { ConfigureResponse } from '../config/types'
import fetchJSON from '../util/fetchJSON'

export default async function configure(election: Election): Promise<void> {
  const response = await fetchJSON<ConfigureResponse>('/scan/configure', {
    method: 'post',
    body: JSON.stringify(election),
    headers: { 'Content-Type': 'application/json' },
  })

  if (response.status !== 'ok') {
    throw new Error(`configure failed with response status: ${response.status}`)
  }
}
