export enum StateMachineEvents {
  // event for initial state transition (IDLE -> PROCESSING)
  LOAD = 'LOAD',
  // during state transition (PROCESSING -> IDLE) invoke returns event with result data
  LOADED = 'LOADED',

  SHOW = 'SHOW',
  HIDE = 'HIDE',
}
