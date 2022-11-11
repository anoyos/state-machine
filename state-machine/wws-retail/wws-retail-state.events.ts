export enum WwsRetailStateEvents {
  // event for initial state transition (IDLE -> PROCESSING)
  LOAD_SHORT_ARTIKEL_4_ETIKETTEN_DRUCK = 'LOAD_SHORT_ARTIKEL_4_ETIKETTEN_DRUCK',
  // during state transition (PROCESSING -> IDLE) invoke returns event with result data
  LOADED_SHORT_ARTIKEL_4_ETIKETTEN_DRUCK = 'LOADED_SHORT_ARTIKEL_4_ETIKETTEN_DRUCK',

  // event for initial state transition (IDLE -> PROCESSING)
  LOAD_START_DATE_OF_NEXT_PRICE_REDUCTION = 'LOAD_START_DATE_OF_NEXT_PRICE_REDUCTION',
  // during state transition (PROCESSING -> IDLE) invoke returns event with result data
  LOADED_START_DATE_OF_NEXT_PRICE_REDUCTION = 'LOADED_START_DATE_OF_NEXT_PRICE_REDUCTION',

  // event for initial state transition (IDLE -> PROCESSING)
  LOAD_ARTIKEL_INVENTUR_QUICK_INFO = 'LOAD_ARTIKEL_INVENTUR_QUICK_INFO',
  // during state transition (PROCESSING -> IDLE) invoke returns event with result data
  LOADED_ARTIKEL_INVENTUR_QUICK_INFO = 'LOADED_ARTIKEL_INVENTUR_QUICK_INFO',

  // event for initial state transition (IDLE -> PROCESSING)
  LOAD_ARTICLE_STOCKINFO_SIMPLE = 'LOAD_ARTICLE_STOCKINFO_SIMPLE',
  // during state transition (PROCESSING -> IDLE) invoke returns event with result data
  LOADED_ARTICLE_STOCKINFO_SIMPLE = 'LOADED_ARTICLE_STOCKINFO_SIMPLE',

  // event for initial state transition (IDLE -> PROCESSING)
  LOAD_ARTIKEL_BESTANDSZEILE_RFID = 'LOAD_ARTIKEL_BESTANDSZEILE_RFID',
  // during state transition (PROCESSING -> IDLE) invoke returns event with result data
  LOADED_ARTIKEL_BESTANDSZEILE_RFID = 'LOADED_ARTIKEL_BESTANDSZEILE_RFID',

  // event for initial state transition (IDLE -> PROCESSING)
  LOAD_ARTIKELHISTORIE = 'LOAD_ARTIKELHISTORIE',
  // during state transition (PROCESSING -> IDLE) invoke returns event with result data
  LOADED_ARTIKELHISTORIE = 'LOADED_ARTIKELHISTORIE',
}
