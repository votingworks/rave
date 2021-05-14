import { Provider } from '@votingworks/types'
import { fetchJSON } from '@votingworks/utils'

interface MachineConfigResponse {
  machineId: string
}

const machineConfigProvider: Provider<{ machineId: string }> = {
  async get() {
    const { machineId } = await fetchJSON<MachineConfigResponse>(
      '/machine-config'
    )

    return {
      machineId,
    }
  },
}

export default machineConfigProvider
