import { Injectable } from '@angular/core';
import { Observable, of, zip } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { interpret, Interpreter, Machine, StateSchema } from 'xstate';
import { WWSRetailServiceNS } from 'service-repo-client-wcf';
import { WwsRetailStore } from '../../store/wws-retail/wws-retail-store';
import { SpinnerStateMachine } from '../spinner/spinner-state.machine';
import { StateMachineEvent } from '../state-machine.event';
import { StateMachineUtils } from '../state-machine.utils';
import { ArticleInfoStateEvents } from './article-info-state.events';

/**
 * State machine for article info component
 */
@Injectable()
export class ArticleInfoStateMachine {
  stateMachine: Interpreter<any, StateSchema, StateMachineEvent<any>, any>;

  constructor(public wwsRetailStore: WwsRetailStore, private spinnerStateMachine: SpinnerStateMachine) {
    this.initStateMachine();
  }

  private initStateMachine() {
    const machine = Machine<any, StateMachineEvent<any>>(this.createArticleInfoConfig());
    this.stateMachine = interpret(machine).start();
  }

  /**
   * State machine configuration
   */
  private createArticleInfoConfig() {
    return StateMachineUtils.createBasicConfig<WWSRetailServiceNS.ArtikelInventurQuickInfoCriteria>(
      // defines a transition/state flow where an event triggers 2 service calls for:
      // 1. list of artikelInventurQuickInfo,
      // 2. ArticleStockInfoSimple.
      // Note: 2. is only executed when 1. contains only one article
      (_, incomingEvent) => {
        // dispatch/service calls for 3 entities (as observables)
        const artikelInventurQuickInfoCriteria = incomingEvent.payload;

        // store dispatcher: load data into store
        const artikelInventurQuickInfo$ = this.wwsRetailStore.dispatchArtikelInventurQuickInfoByCriteria(artikelInventurQuickInfoCriteria);

        const stockInfo$ = artikelInventurQuickInfo$.pipe(
          concatMap((articles) => {
            let result: Observable<WWSRetailServiceNS.ArticleStockInfoSimple>;
            if (articles && articles.length === 1) {
              // store dispatcher: load data into store
              result = this.wwsRetailStore.dispatchArticleStockInfoSimpleByCriteria(articles[0].Ausprsl);
            }

            return result;
          })
        );

        // pass all 2 service results back for output event
        const result$ = zip(artikelInventurQuickInfo$, stockInfo$);
        return this.spinnerStateMachine.sendEvent(result$);
      },
      ArticleInfoStateEvents.LOAD_ARTIKEL_INFO,
      ArticleInfoStateEvents.LOADED_ARTIKEL_INFO
    );
  }

  /**
   * Event call initial state transition
   */
  public sendEventArticleInfo(criteria: WWSRetailServiceNS.ArtikelInventurQuickInfoCriteria) {
    const event = {
      type: ArticleInfoStateEvents.LOAD_ARTIKEL_INFO,
      payload: criteria,
    };
    return this.stateMachine.send(event);
  }
}
