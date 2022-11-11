import { Injectable } from '@angular/core';
import { interpret, Interpreter, Machine, State, StateSchema, StatesConfig } from 'xstate';
import { WWSRetailServiceNS } from 'service-repo-client-wcf';
import { QueryState } from '../../store/query.state';
import { WwsRetailStore } from '../../store/wws-retail/wws-retail-store';
import { StateMachineEvent } from '../state-machine.event';
import { StateMachineUtils } from '../state-machine.utils';
import { WwsRetailStateMachineState } from './wws-retail-state-machine.state';
import { WwsRetailStateEvents } from './wws-retail-state.events';

/**
 * A facade for hiding ngrx specifics.
 */
@Injectable()
export class WwsRetailStateMachine {
  stateMachine: Interpreter<any, StateSchema, StateMachineEvent<any>, any>;

  constructor(public wwsRetailStore: WwsRetailStore) {
    this.initStateMachine();
  }

  private initStateMachine() {
    // parent, parallel state machine containing all other state configs for each service call
    const states: WwsRetailStateMachineState<any> & StatesConfig<any, any, StateMachineEvent<any>> = {
      shortArtikel4EtikettenDruck: this.createShortArtikel4EtikettenDruckConfig(),
      startDateOfNextPriceReduction: this.createStartDateOfNextPriceReductionConfig(),
      artikelInventurQuickInfo: this.createArtikelInventurQuickInfoConfig(),
      articleStockInfoSimple: this.createArticleStockInfoSimpleConfig(),
      artikelhistorie: this.createArtikelhistorieConfig(),
      artikelBestandsZeileRfid: this.createArtikelBestandsZeileRfidConfig(),
    };
    const parallelMachine = Machine<any, StateMachineEvent<any>>({
      type: 'parallel',
      states,
    });

    this.stateMachine = interpret(parallelMachine).start();
  }

  /**
   * State machine configuration
   */
  private createShortArtikel4EtikettenDruckConfig() {
    return StateMachineUtils.createBasicConfig<WWSRetailServiceNS.ShortArtikel4EtikettenDruckCriteria>(
      (_, incomingEvent) => this.wwsRetailStore.dispatchShortArtikel4EtikettenDruckByCriteria(incomingEvent.payload),
      WwsRetailStateEvents.LOAD_SHORT_ARTIKEL_4_ETIKETTEN_DRUCK,
      WwsRetailStateEvents.LOADED_SHORT_ARTIKEL_4_ETIKETTEN_DRUCK
    );
  }

  /**
   * State machine configuration
   */
  private createStartDateOfNextPriceReductionConfig() {
    return StateMachineUtils.createBasicConfig<string>(
      () => this.wwsRetailStore.dispatchStartDateOfNextPriceReduction(),
      WwsRetailStateEvents.LOAD_START_DATE_OF_NEXT_PRICE_REDUCTION,
      // triggers parallel state transitions
      WwsRetailStateEvents.LOADED_START_DATE_OF_NEXT_PRICE_REDUCTION
    );
  }

  /**
   * State machine configuration
   */
  private createArtikelInventurQuickInfoConfig() {
    return StateMachineUtils.createBasicConfig<WWSRetailServiceNS.ArtikelInventurQuickInfoCriteria>(
      (_, incomingEvent) => this.wwsRetailStore.dispatchArtikelInventurQuickInfoByCriteria(incomingEvent.payload),
      WwsRetailStateEvents.LOAD_ARTIKEL_INVENTUR_QUICK_INFO,
      // triggers parallel state transitions
      WwsRetailStateEvents.LOADED_ARTIKEL_INVENTUR_QUICK_INFO
    );
  }

  /**
   * State machine configuration
   */
  private createArticleStockInfoSimpleConfig() {
    return StateMachineUtils.createBasicConfig<number>(
      (_, incomingEvent) => this.wwsRetailStore.dispatchArticleStockInfoSimpleByCriteria(incomingEvent.payload),
      WwsRetailStateEvents.LOAD_ARTICLE_STOCKINFO_SIMPLE,
      WwsRetailStateEvents.LOADED_ARTICLE_STOCKINFO_SIMPLE
    );
  }

  /**
   * State machine configuration
   */
  private createArtikelBestandsZeileRfidConfig() {
    return StateMachineUtils.createBasicConfig<WWSRetailServiceNS.ArtikelBestandsZeileCriteria>(
      (_, incomingEvent) => this.wwsRetailStore.dispatchArtikelBestandsZeileRfidByCriteria(incomingEvent.payload),
      WwsRetailStateEvents.LOAD_ARTIKEL_BESTANDSZEILE_RFID,
      WwsRetailStateEvents.LOADED_ARTIKEL_BESTANDSZEILE_RFID
    );
  }

  /**
   * State machine configuration
   */
  private createArtikelhistorieConfig() {
    return StateMachineUtils.createBasicConfig<WWSRetailServiceNS.ArtikelhistorieCriteria>(
      (_, incomingEvent) => this.wwsRetailStore.dispatchArtikelhistorieByCriteria(incomingEvent.payload),
      WwsRetailStateEvents.LOAD_ARTIKELHISTORIE,
      WwsRetailStateEvents.LOADED_ARTIKELHISTORIE
    );
  }

  public sendEventShortArtikel4EtikettenDruck(criteria: WWSRetailServiceNS.ShortArtikel4EtikettenDruckCriteria): State<any, StateMachineEvent<QueryState>> {
    const event = {
      type: WwsRetailStateEvents.LOAD_SHORT_ARTIKEL_4_ETIKETTEN_DRUCK,
      payload: criteria,
    };
    return this.stateMachine.send(event);
  }

  public sendEventStartDateOfNextPriceReduction(): State<any, StateMachineEvent<QueryState>> {
    const event = {
      type: WwsRetailStateEvents.LOAD_START_DATE_OF_NEXT_PRICE_REDUCTION,
    };
    return this.stateMachine.send(event);
  }

  public sendEventArtikelInventurQuickInfo(criteria: WWSRetailServiceNS.ArtikelInventurQuickInfoCriteria): State<any, StateMachineEvent<QueryState>> {
    const event = {
      type: WwsRetailStateEvents.LOAD_ARTIKEL_INVENTUR_QUICK_INFO,
      payload: criteria,
    };
    return this.stateMachine.send(event);
  }

  public sendArtikelBestandsZeileRfid(criteria: WWSRetailServiceNS.ArtikelBestandsZeileCriteria): State<any, StateMachineEvent<QueryState>> {
    const event = {
      type: WwsRetailStateEvents.LOAD_ARTIKEL_BESTANDSZEILE_RFID,
      payload: criteria,
    };
    return this.stateMachine.send(event);
  }

  public sendEventArtikelhistorie(criteria: WWSRetailServiceNS.ArtikelhistorieCriteria): State<any, StateMachineEvent<QueryState>> {
    const event = {
      type: WwsRetailStateEvents.LOAD_ARTIKELHISTORIE,
      payload: criteria,
    };
    return this.stateMachine.send(event);
  }
}
