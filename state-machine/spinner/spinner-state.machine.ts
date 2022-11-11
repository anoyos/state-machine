import { Injectable, NgZone } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, defer } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { interpret, Interpreter, Machine, MachineConfig, StateSchema } from 'xstate';
import { StateMachineEvent } from '../state-machine.event';
import { StateMachineEvents } from '../state-machine.events';
import { StateMachineStates } from '../state-machine.states';

type Payload = {
  timeout: number;
};
/**
 * State machine for article info component
 */
@Injectable()
export class SpinnerStateMachine {
  stateMachine: Interpreter<any, StateSchema, StateMachineEvent<any>, any>;

  constructor(private spinner: NgxSpinnerService, private ngZone: NgZone) {
    this.initStateMachine();
  }

  private initStateMachine() {
    const machine = Machine<any, StateMachineEvent<Payload>>(this.createStateConfig());
    this.stateMachine = interpret(machine).start();
  }

  /**
   * State machine configuration
   */
  private createStateConfig() {
    type Context = { timer: any; invokes: number };

    const config: MachineConfig<Context, StateSchema<Context>, StateMachineEvent<Payload>> = {
      context: { timer: null, invokes: 0 },
      initial: StateMachineStates.HIDDEN,
      states: {
        // initial IDLE state listens start event
        [StateMachineStates.HIDDEN]: {
          entry: (context) => clearTimeout(context.timer),
          on: {
            [StateMachineEvents.SHOW]: {
              target: StateMachineStates.VISIBLE,
              actions: (context, event) => {
                context.invokes++;
                this.ngZone.run(() => this.spinner.show());
                context.timer = setTimeout(
                  (that: SpinnerStateMachine) => {
                    that.stateMachine.send({ type: StateMachineEvents.HIDE });
                  },
                  event.payload.timeout,
                  this
                );
              },
            },
            [StateMachineEvents.HIDE]: StateMachineStates.HIDDEN,
          },
        },
        [StateMachineStates.VISIBLE]: {
          on: {
            [StateMachineEvents.HIDE]: {
              target: StateMachineStates.HIDDEN,
              actions: (context) => {
                clearTimeout(context.timer);
                this.ngZone.run(() => this.spinner.hide());
              },
              cond: (context) => {
                context.invokes--;
                return !context.invokes;
              },
            },
            [StateMachineEvents.SHOW]: {
              target: StateMachineStates.VISIBLE,
              actions: (context) => {
                context.invokes++;
              },
            },
          },
        },
      },
    };
    return config;
  }

  /**
   * Event call initial state transition
   */
  public sendEvent<T>(obs$: Observable<T>, timeout = 5000): Observable<T> {
    return defer(() => {
      this.stateMachine.send({ type: StateMachineEvents.SHOW, payload: { timeout } });
      return obs$.pipe(finalize(() => this.stateMachine.send({ type: StateMachineEvents.HIDE })));
    });
  }
}
