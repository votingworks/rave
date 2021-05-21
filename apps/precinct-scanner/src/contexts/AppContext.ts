import { ElectionDefinition } from '@votingworks/types'
import { createContext } from 'react'
import { MachineConfig } from '../config/types'

export interface AppContextInterface {
  electionDefinition?: ElectionDefinition
  machineConfig: Readonly<MachineConfig>
  currentPrecinctId?: string
}

const appContext: AppContextInterface = {
  electionDefinition: undefined,
  currentPrecinctId: undefined,
  machineConfig: { machineId: '0000', codeVersion: '' },
}

const AppContext = createContext(appContext)

export default AppContext