export enum StateMachineStates {
  // start state
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',

  HANDLE = 'HANDLE',
  HANDLE_RFID = 'HANDLE_RFID',
  HANDLE_BARCODE = 'HANDLE_BARCODE',

  // spinner
  VISIBLE = 'VISIBLE',
  HIDDEN = 'HIDDEN',

  FINISH = 'FINISH',
}
