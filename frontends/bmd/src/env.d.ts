declare namespace NodeJS {
  export interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly REACT_APP_VX_APP_MODE?: string;
    readonly REACT_APP_VX_MACHINE_ID?: string;
    readonly REACT_APP_VX_CODE_VERSION?: string;
  }
}
