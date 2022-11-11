import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { WWSRetailServiceNS } from 'service-repo-client-wcf';
import { DataFixtures } from '../../../../test/data-fixtures.test';
import { UnitDataFixtures } from '../../../../test/unit-data-fixtures.test';
import { UnitTestSetup } from '../../../../test/unit-test-setup.test';
import { WwsRetailStore } from '../../store/wws-retail/wws-retail-store';
import { StateMachineStates } from '../state-machine.states';
import { WwsRetailStateMachineState } from './wws-retail-state-machine.state';
import { WwsRetailStateMachine } from './wws-retail-state.machine';

describe('WwsRetailStateMachine unit test', () => {
  let setup: UnitTestSetup<any>;
  let wwsRetailStore: WwsRetailStore;
  let wwsRetailStateMachine: WwsRetailStateMachine;
  let articleInventur: WWSRetailServiceNS.ArtikelInventurQuickInfo;
  let lagerBestand: WWSRetailServiceNS.Lagerbestand;
  let artikelBestandsZeile: WWSRetailServiceNS.ArtikelBestandsZeile;
  let artikelhistorie: WWSRetailServiceNS.Artikelhistorie;
  let startDateOfNextPriceReduction: Date;

  beforeEach(() => {
    articleInventur = DataFixtures.newArtikelInventurQuickInfo();
    lagerBestand = DataFixtures.newLagerbestand();
    artikelBestandsZeile = DataFixtures.newArtikelBestandsZeile();
    artikelhistorie = DataFixtures.newArtikelhistorie();
    startDateOfNextPriceReduction = new Date();
    jest.clearAllMocks();
    setup = UnitTestSetup.setup<any, any>();
    wwsRetailStateMachine = setup.get(WwsRetailStateMachine);
    wwsRetailStore = setup.get(WwsRetailStore);
    expect(wwsRetailStateMachine).toBeDefined();
  });

  function getSpies() {
    const spies = {
      ...UnitDataFixtures.getSpies(),
    };
    spies.wwsRetailService_getArtikelInventurQuickInfoByCriteria.mockImplementation(() => {
      return of([articleInventur]);
    });
    spies.wwsRetailService_getLagerbestandListByCriteria.mockImplementation(() => {
      return of([lagerBestand]);
    });
    spies.wwsRetailService_getArtikelBestandsZeileRfidByCriteria.mockImplementation(() => {
      return of([artikelBestandsZeile]);
    });
    spies.wwsRetailService_getArtikelhistorieByCriteria.mockImplementation(() => {
      return of([artikelhistorie]);
    });
    spies.wwsRetailService_getStartDateOfNextPriceReduction.mockImplementation((criteria) => {
      return of(startDateOfNextPriceReduction);
    });
    return spies;
  }

  it('sendEventShortArtikel4EtikettenDruck(): dispatch service call (and save entity into store)', async () => {
    // mock service calls
    const spies = getSpies();
    // before test entity is not in store
    let entity = await wwsRetailStore.getShortArtikel4EtikettenDruck().pipe(take(1)).toPromise();
    expect(entity).toBeUndefined();

    // test
    const criteria = new WWSRetailServiceNS.ShortArtikel4EtikettenDruckCriteria();
    const state = wwsRetailStateMachine.sendEventShortArtikel4EtikettenDruck(criteria);

    // assert state changed back to idle
    const wwsState = (state.value as unknown) as WwsRetailStateMachineState<any>;
    expect(wwsState.shortArtikel4EtikettenDruck).toEqual(StateMachineStates.IDLE);
    // assert service is called
    expect(spies.wwsRetailService_getShortArtikel4EtikettenDruckByCriteria).toBeCalledTimes(1);
    // assert entity is in store
    entity = await wwsRetailStore.getShortArtikel4EtikettenDruck().pipe(take(1)).toPromise();
    expect(entity.response).toEqual([]);
  });

  it('sendEventShortArtikel4EtikettenDruck(): throws error', async () => {
    // mock service calls
    const spies = getSpies();
    // event calls store dispatcher: mock dispatcher and throw error
    const error = new Error('test error');
    spies.wwsRetailStore_dispatchShortArtikel4EtikettenDruckByCriteria.mockImplementation((_) => {
      return new Observable<Array<WWSRetailServiceNS.ShortArtikel4EtikettenDruck>>((subscriber) => {
        subscriber.error(error);
      });
    });

    // test
    const criteria = new WWSRetailServiceNS.ShortArtikel4EtikettenDruckCriteria();
    const state = wwsRetailStateMachine.sendEventShortArtikel4EtikettenDruck(criteria);

    // assert state changed back to idle
    const wwsState = (state.value as unknown) as WwsRetailStateMachineState<any>;
    expect(wwsState.artikelInventurQuickInfo).toEqual(StateMachineStates.IDLE);
    // assert last event contains error
    expect(state.history.event.payload.error).toEqual(error);
  });

  it('sendEventStartDateOfNextPriceReduction(): dispatch service call (and save entity into store)', async () => {
    // mock service calls
    const spies = getSpies();
    // before test entity is not in store
    let entity = await wwsRetailStore.getStartDateOfNextPriceReduction().pipe(take(1)).toPromise();
    expect(entity).toBeUndefined();

    // test
    const state = wwsRetailStateMachine.sendEventStartDateOfNextPriceReduction();

    // assert state changed back to idle
    const wwsState = (state.value as unknown) as WwsRetailStateMachineState<any>;
    expect(wwsState.startDateOfNextPriceReduction).toEqual(StateMachineStates.IDLE);
    // assert service is called
    expect(spies.wwsRetailService_getStartDateOfNextPriceReduction).toBeCalledTimes(1);
    // assert entity is in store
    entity = await wwsRetailStore.getStartDateOfNextPriceReduction().pipe(take(1)).toPromise();
    expect(entity.response).toEqual(startDateOfNextPriceReduction);
  });

  it('sendEventStartDateOfNextPriceReduction(): throws error', async () => {
    // mock service calls
    const spies = getSpies();
    // event calls store dispatcher: mock dispatcher and throw error
    const error = new Error('test error');
    spies.wwsRetailStore_dispatchStartDateOfNextPriceReduction.mockImplementation(() => {
      return new Observable<Date>((subscriber) => {
        subscriber.error(error);
      });
    });

    // test
    const state = wwsRetailStateMachine.sendEventStartDateOfNextPriceReduction();

    // assert state changed back to idle
    const wwsState = (state.value as unknown) as WwsRetailStateMachineState<any>;
    expect(wwsState.startDateOfNextPriceReduction).toEqual(StateMachineStates.IDLE);
    // assert last event contains error
    expect(state.history.event.payload.error).toEqual(error);
  });

  it('sendEventArtikelInventurQuickInfo(): dispatch service call (and save entity into store)', async () => {
    // mock service calls
    const spies = getSpies();
    // before test entity is not in store
    let entity = await wwsRetailStore.getArtikelInventurQuickInfoState().pipe(take(1)).toPromise();
    expect(entity).toBeUndefined();

    // test
    const criteria = new WWSRetailServiceNS.ArtikelInventurQuickInfoCriteria();
    const state = wwsRetailStateMachine.sendEventArtikelInventurQuickInfo(criteria);

    // assert state changed back to idle
    const wwsState = (state.value as unknown) as WwsRetailStateMachineState<any>;
    expect(wwsState.artikelInventurQuickInfo).toEqual(StateMachineStates.IDLE);
    // assert service is called
    expect(spies.wwsRetailService_getArtikelInventurQuickInfoByCriteria).toBeCalledTimes(1);
    // assert entity is in store
    entity = await wwsRetailStore.getArtikelInventurQuickInfoState().pipe(take(1)).toPromise();
    expect(entity.response).toEqual([articleInventur]);
  });

  it('sendEventArtikelInventurQuickInfo(): throws error', async () => {
    // mock service calls
    const spies = getSpies();
    // event calls store dispatcher: mock dispatcher and throw error
    const error = new Error('test error');
    spies.wwsRetailStore_dispatchArtikelInventurQuickInfoByCriteria.mockImplementation((_) => {
      return new Observable<Array<WWSRetailServiceNS.ArtikelInventurQuickInfo>>((subscriber) => {
        subscriber.error(error);
      });
    });

    // test
    const criteria = new WWSRetailServiceNS.ArtikelInventurQuickInfoCriteria();
    const state = wwsRetailStateMachine.sendEventArtikelInventurQuickInfo(criteria);

    // assert state changed back to idle
    const wwsState = (state.value as unknown) as WwsRetailStateMachineState<any>;
    expect(wwsState.artikelInventurQuickInfo).toEqual(StateMachineStates.IDLE);
    // assert last event contains error
    expect(state.history.event.payload.error).toEqual(error);
  });

  it('sendEventArtikelhistorie(): dispatch service call (and save entity into store)', async () => {
    // mock service calls
    const spies = getSpies();
    // before test entiy is not in store
    let entity = await wwsRetailStore.getArtikelhistorieState().pipe(take(1)).toPromise();
    expect(entity).toBeUndefined();

    // test
    const criteria = new WWSRetailServiceNS.ArtikelhistorieCriteria();
    const state = wwsRetailStateMachine.sendEventArtikelhistorie(criteria);

    // assert state changed back to idle
    const wwsState = (state.value as unknown) as WwsRetailStateMachineState<any>;
    expect(wwsState.artikelhistorie).toEqual(StateMachineStates.IDLE);
    // assert service is called
    expect(spies.wwsRetailService_getArtikelhistorieByCriteria).toBeCalledTimes(1);
    // assert entity is in store
    entity = await wwsRetailStore.getArtikelhistorieState().pipe(take(1)).toPromise();
    expect(entity.response).toEqual([artikelhistorie]);
  });

  it('sendEventArtikelhistorie(): throws error', async () => {
    // mock service calls
    const spies = getSpies();
    // event calls store dispatcher: mock dispatcher and throw error
    const error = new Error('test error');
    spies.wwsRetailStore_dispatchArtikelhistorieByCriteria.mockImplementation((_) => {
      return new Observable<Array<WWSRetailServiceNS.Artikelhistorie>>((subscriber) => {
        subscriber.error(error);
      });
    });

    // test
    const criteria = new WWSRetailServiceNS.ArtikelhistorieCriteria();
    const state = wwsRetailStateMachine.sendEventArtikelhistorie(criteria);

    // assert state changed back to idle
    const wwsState = (state.value as unknown) as WwsRetailStateMachineState<any>;
    expect(wwsState.artikelhistorie).toEqual(StateMachineStates.IDLE);
    // assert last event contains error
    expect(state.history.event.payload.error).toEqual(error);
  });
});
