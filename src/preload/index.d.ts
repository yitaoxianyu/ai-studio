import { IpcRenderer } from 'electron'

export type StoreApi = {
  getStore: (key: string) => Promise<unknown>
  setStore: (key: string, value: unknown) => Promise<boolean>
  deleteStore: (key: string) => Promise<boolean>
  windowMinimize: () => Promise<void>
  windowMaximize: () => Promise<void>
  windowClose: () => Promise<void>
}

declare global {
  interface Window {
    api: StoreApi
    ipcRenderer: IpcRenderer
  }
}
