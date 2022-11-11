import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { setTimeout } from 'timers';
import { UnitDataFixtures } from '../../../../test/unit-data-fixtures.test';
import { UnitTestSetup } from '../../../../test/unit-test-setup.test';
import { StateMachineStates } from '../state-machine.states';
import { SpinnerStateMachine } from './spinner-state.machine';

describe('SpinnerStateMachine unit test', () => {
  let setup: UnitTestSetup<any>;
  let serviceStateMachine: SpinnerStateMachine;

  beforeEach(() => {
    jest.clearAllMocks();
    setup = UnitTestSetup.setup<any, any>();

    serviceStateMachine = setup.get(SpinnerStateMachine);
    expect(serviceStateMachine).toBeDefined();
    expect(serviceStateMachine.stateMachine.state.value).toEqual(StateMachineStates.HIDDEN);
  });

  it('spinner is hidden after observable is done', async () => {
    const spies = UnitDataFixtures.getSpies();
    // create a dummy observable the spinner is showing on
    const obs$ = new Observable<string>((subscriber) => {
      setTimeout(() => {
        subscriber.next('do something');
        subscriber.complete();
      }, 500);
    });

    // test: show spinner
    const promis$ = serviceStateMachine.sendEvent(obs$).pipe(take(1)).toPromise();
    // assert when observable is still running
    expect(serviceStateMachine.stateMachine.state.value).toEqual(StateMachineStates.VISIBLE);
    expect(spies.ngxSpinnerService_show).toBeCalledTimes(1);
    expect(spies.ngxSpinnerService_hide).toBeCalledTimes(0);
    // assert list of observables contains observable;
    expect(serviceStateMachine.stateMachine.state.context.invokes).toEqual(1);

    // wait for observable being finished
    await promis$;
    // assert when observable is finished
    expect(serviceStateMachine.stateMachine.state.value).toEqual(StateMachineStates.HIDDEN);
    expect(spies.ngxSpinnerService_show).toBeCalledTimes(1);
    expect(spies.ngxSpinnerService_hide).toBeCalledTimes(1);
    // assert list of observables is cleared;
    expect(serviceStateMachine.stateMachine.state.context.invokes).toEqual(0);
  });

  it('spinner is hidden after timeout on a long running observable', async () => {
    const spies = UnitDataFixtures.getSpies();
    // create a dummy observable the spinner is showing on
    const obs$ = new Observable<string>((subscriber) => {
      setTimeout(() => {
        subscriber.next('do something');
        subscriber.complete();
      }, 3000);
    });

    // test: show spinner with timeout of 500ms
    const promise$ = serviceStateMachine.sendEvent(obs$, 500).pipe(take(1)).toPromise();
    // assert when observable is still running
    expect(serviceStateMachine.stateMachine.state.value).toEqual(StateMachineStates.VISIBLE);
    expect(spies.ngxSpinnerService_show).toBeCalledTimes(1);
    expect(spies.ngxSpinnerService_hide).toBeCalledTimes(0);
    // assert list of observables contains observable;
    expect(serviceStateMachine.stateMachine.state.context.invokes).toEqual(1);

    // wait for timeout
    await new Promise((resolve) => {
      setTimeout(resolve, 600);
    });
    // assert when observable is finished
    expect(serviceStateMachine.stateMachine.state.value).toEqual(StateMachineStates.HIDDEN);
    expect(spies.ngxSpinnerService_show).toBeCalledTimes(1);
    expect(spies.ngxSpinnerService_hide).toBeCalledTimes(1);
    // assert list of observables is cleared;
    expect(serviceStateMachine.stateMachine.state.context.invokes).toEqual(0);

    // wait for observable being finished
    await promise$;
    // assert spinner is still closed
    expect(serviceStateMachine.stateMachine.state.value).toEqual(StateMachineStates.HIDDEN);
    expect(spies.ngxSpinnerService_show).toBeCalledTimes(1);
    expect(spies.ngxSpinnerService_hide).toBeCalledTimes(1);
  });

  it('spinner is hidden after observable throws error', async () => {
    const spies = UnitDataFixtures.getSpies();
    const error = new Error('test error 1');
    // create a dummy observable the spinner is showing on
    const obs$ = new Observable<string>((subscriber) => {
      setTimeout(() => {
        subscriber.error(error);
      }, 500);
    });

    // test: show spinner
    const promise$ = serviceStateMachine.sendEvent(obs$).pipe(take(1)).toPromise();
    // assert when observable is still running
    expect(serviceStateMachine.stateMachine.state.value).toEqual(StateMachineStates.VISIBLE);
    expect(spies.ngxSpinnerService_show).toBeCalledTimes(1);
    expect(spies.ngxSpinnerService_hide).toBeCalledTimes(0);
    // assert list of observables contains observable;
    expect(serviceStateMachine.stateMachine.state.context.invokes).toEqual(1);

    // wait for observable being finished
    let thrown: Error;
    try {
      await promise$;
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toEqual(error);

    // assert when observable is finished
    expect(serviceStateMachine.stateMachine.state.value).toEqual(StateMachineStates.HIDDEN);
    expect(spies.ngxSpinnerService_show).toBeCalledTimes(1);
    expect(spies.ngxSpinnerService_hide).toBeCalledTimes(1);
    // assert list of observables is cleared;
    expect(serviceStateMachine.stateMachine.state.context.invokes).toEqual(0);
  });

  it('spinner is hidden after longest observable is done (second observable faster than first)', async () => {
    const spies = UnitDataFixtures.getSpies();

    // test: show spinner for first observable
    const obs1$ = new Observable<string>((subscriber) => {
      setTimeout(() => {
        subscriber.next('do something 1');
        subscriber.complete();
      }, 800);
    });
    const promise1$ = serviceStateMachine.sendEvent(obs1$).pipe(take(1)).toPromise();
    // assert when observable 1 is still running
    expect(serviceStateMachine.stateMachine.state.value).toEqual(StateMachineStates.VISIBLE);
    expect(spies.ngxSpinnerService_show).toBeCalledTimes(1);
    expect(spies.ngxSpinnerService_hide).toBeCalledTimes(0);
    // assert list of observables contains observable;
    expect(serviceStateMachine.stateMachine.state.context.invokes).toEqual(1);

    // test: show spinner for second observable
    const obs2$ = new Observable<string>((subscriber) => {
      setTimeout(() => {
        subscriber.next('do something 2');
        subscriber.complete();
      }, 500);
    });
    const promise2$ = serviceStateMachine.sendEvent(obs2$).pipe(take(1)).toPromise();
    // assert when observable 2 is still running
    expect(serviceStateMachine.stateMachine.state.value).toEqual(StateMachineStates.VISIBLE);
    expect(spies.ngxSpinnerService_show).toBeCalledTimes(1);
    expect(spies.ngxSpinnerService_hide).toBeCalledTimes(0);
    // assert list of observables contains observable;
    expect(serviceStateMachine.stateMachine.state.context.invokes).toEqual(2);

    // wait for o2 is finished but o1 not
    await promise2$;
    // assert when observable 1 is still running
    expect(serviceStateMachine.stateMachine.state.value).toEqual(StateMachineStates.VISIBLE);
    expect(spies.ngxSpinnerService_show).toBeCalledTimes(1);
    expect(spies.ngxSpinnerService_hide).toBeCalledTimes(0);

    // wait for o1 being finished
    await promise1$;

    // assert when observables are finished
    expect(serviceStateMachine.stateMachine.state.value).toEqual(StateMachineStates.HIDDEN);
    expect(spies.ngxSpinnerService_show).toBeCalledTimes(1);
    expect(spies.ngxSpinnerService_hide).toBeCalledTimes(1);
    // assert list of observables is cleared;
    expect(serviceStateMachine.stateMachine.state.context.invokes).toEqual(0);
  });

  it('spinner is hidden after longest observable is done, o2 throws error', async () => {
    const spies = UnitDataFixtures.getSpies();

    // test: show spinner for first observable
    const obs1$ = new Observable<string>((subscriber) => {
      setTimeout(() => {
        subscriber.next('do something 1');
        subscriber.complete();
      }, 800);
    });
    const promise1$ = serviceStateMachine.sendEvent(obs1$).pipe(take(1)).toPromise();
    // assert when observable 1 is still running
    expect(serviceStateMachine.stateMachine.state.value).toEqual(StateMachineStates.VISIBLE);
    expect(spies.ngxSpinnerService_show).toBeCalledTimes(1);
    expect(spies.ngxSpinnerService_hide).toBeCalledTimes(0);
    // assert list of observables contains observable;
    expect(serviceStateMachine.stateMachine.state.context.invokes).toEqual(1);

    // test: show spinner for second observable
    const error2 = new Error('test error 2');
    const obs2$ = new Observable<string>((subscriber) => {
      setTimeout(() => {
        subscriber.error(error2);
      }, 500);
    });
    const promise2$ = serviceStateMachine.sendEvent(obs2$).pipe(take(1)).toPromise();
    // assert when observable 2 is still running
    expect(serviceStateMachine.stateMachine.state.value).toEqual(StateMachineStates.VISIBLE);
    expect(spies.ngxSpinnerService_show).toBeCalledTimes(1);
    expect(spies.ngxSpinnerService_hide).toBeCalledTimes(0);
    // assert list of observables contains observable;
    expect(serviceStateMachine.stateMachine.state.context.invokes).toEqual(2);

    // wait for o2 is finished but o1 not
    let thrown: Error;
    try {
      await promise2$;
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toEqual(error2);
    // assert when observable 1 is still running
    expect(serviceStateMachine.stateMachine.state.value).toEqual(StateMachineStates.VISIBLE);
    expect(spies.ngxSpinnerService_show).toBeCalledTimes(1);
    expect(spies.ngxSpinnerService_hide).toBeCalledTimes(0);

    // wait for o1 being finished
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 200);
    });

    // wait for observables being finished
    await promise1$;
    // assert when observables are finished
    expect(serviceStateMachine.stateMachine.state.value).toEqual(StateMachineStates.HIDDEN);
    expect(spies.ngxSpinnerService_show).toBeCalledTimes(1);
    expect(spies.ngxSpinnerService_hide).toBeCalledTimes(1);
    // assert list of observables is cleared;
    expect(serviceStateMachine.stateMachine.state.context.invokes).toEqual(0);
  });
});
