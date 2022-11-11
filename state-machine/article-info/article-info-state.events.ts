export enum ArticleInfoStateEvents {
  // event for initial state transition (IDLE -> PROCESSING)
  LOAD_ARTIKEL_INFO = 'LOAD_ARTIKEL_INFO',
  // during state transition (PROCESSING -> IDLE) invoke returns event with result data
  LOADED_ARTIKEL_INFO = 'LOADED_ARTIKEL_INFO',
}
