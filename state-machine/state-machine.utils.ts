import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MachineConfig, StateSchema } from 'xstate';
import { QueryState } from '../store/query.state';
import { StateMachineEvent } from './state-machine.event';
import { StateMachineEvents } from './state-machine.events';
import { StateMachineStates } from './state-machine.states';

@Injectable()
export class StateMachineUtils {
  /**
   * Creates a state machine config looking like this:
   *
   * const serviceStateMachineConfig = {
   *   initial: 'IDLE',
   *   states: {
   *     // initial IDLE state listens start event
   *     IDLE: {
   *       on: {
   *         // transition to end state PROCESSING (NB: move events can listen to each state!)
   *         START_EVENT: 'PROCESSING',
   *       },
   *     },
   *     PROCESSING: {
   *       // invoke: actor model with input and output event
   *       invoke: {
   *         src: (context, incomingEvent) => {
   *           const obs$ = this.someService.getSomeData(criteria);
   *           // subscribe and dispatch data into store
   *           obs$.subscribe((result) => {
   *             this.store.dispatch(myNgrxAction({ payload: result }));
   *           });
   *           // map and return END_EVENT
   *           return obs$.pipe(
   *             map((result) => {
   *               // return output event with payloa
   *               return { type: 'END_EVENT', payload: result };
   *             })
   *           );
   *         },
   *         // transition back to initial/start state IDLE
   *         onDone: 'IDLE',
   *       },
   *     },
   *   },
   * }
   *
   * @param invokeFunction handles incoming event from previous state and return output event
   * @param startState
   * @param endState
   * @param startEvent
   * @param endEvent
   */
  static createBasicConfig<TPayload = any, TContext = any>(
    invokeFunction: (context: TContext, event: StateMachineEvent<TPayload>) => Observable<any>,
    // transition for start state
    startEvent: string = StateMachineEvents.LOAD,
    // transition for end state
    endEvent: string = StateMachineEvents.LOADED
  ) {
    const config: MachineConfig<TContext, StateSchema<TContext>, StateMachineEvent<TPayload>> = {
      initial: StateMachineStates.IDLE,
      states: {
        // initial IDLE state listens start event
        [StateMachineStates.IDLE]: {
          on: {
            // transition to end state PROCESSING (NB: move events can listen to each state!)
            [startEvent]: StateMachineStates.PROCESSING,
          },
        },
        [StateMachineStates.PROCESSING]: {
          // invoke: actor model with input and output event
          invoke: {
            src: (context, incomingEvent) => {
              const result = invokeFunction(context, incomingEvent).pipe(
                map((response) => {
                  const outputEvent: StateMachineEvent<QueryState> = {
                    type: endEvent,
                    payload: {
                      request: incomingEvent.payload,
                      response,
                    },
                  };
                  return outputEvent;
                }),
                catchError<any, Observable<StateMachineEvent<QueryState>>>((error) => {
                  // return/pass error as event
                  const outputEvent: StateMachineEvent<QueryState> = {
                    type: endEvent,
                    payload: {
                      request: incomingEvent.payload,
                      error,
                    },
                  };
                  return of(outputEvent);
                })
              );
              return result;
            },
          },
          on: {
            // event coming from invoker
            [endEvent]: StateMachineStates.IDLE,
          },
        },
      },
    };
    return config;
  }
}
