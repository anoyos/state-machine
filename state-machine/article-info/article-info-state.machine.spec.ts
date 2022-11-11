import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { WWSRetailServiceNS } from 'service-repo-client-wcf';
import { DataFixtures } from '../../../../test/data-fixtures.test';
import { UnitDataFixtures } from '../../../../test/unit-data-fixtures.test';
import { UnitTestSetup } from '../../../../test/unit-test-setup.test';
import { WwsRetailStore } from '../../store/wws-retail/wws-retail-store';
import { StateMachineStates } from '../state-machine.states';
import { ArticleInfoStateMachine } from './article-info-state.machine';

describe('ArticleInfoServiceMachine unit test', () => {
  let setup: UnitTestSetup<any>;
  let wwsRetailStore: WwsRetailStore;
  let articleInfoStateMachine: ArticleInfoStateMachine;
  let articleInventur: WWSRetailServiceNS.ArtikelInventurQuickInfo;
  let articleStockInfoSimple: WWSRetailServiceNS.ArticleStockInfoSimple;

  beforeEach(() => {
    articleInventur = DataFixtures.newArtikelInventurQuickInfo();
    articleStockInfoSimple = DataFixtures.newArticleStockInfoSimple();
    jest.clearAllMocks();
    setup = UnitTestSetup.setup<any, any>();
    articleInfoStateMachine = setup.get(ArticleInfoStateMachine);
    wwsRetailStore = setup.get(WwsRetailStore);
    expect(articleInfoStateMachine).toBeDefined();
  });

  function getSpies() {
    const spies = {
      ...UnitDataFixtures.getSpies(),
    };
    spies.wwsRetailService_getArtikelInventurQuickInfoByCriteria.mockImplementation((_) => {
      return of([articleInventur]);
    });
    spies.wwsRetailService_getArticleStockInfoSimpleByCriteria.mockImplementation((mdkunr, ausprsl) => {
      return of(articleStockInfoSimple);
    });
    return spies;
  }

  it('sendEventArticleInfo(): dispatch service call (and save entities into store)', async () => {
    // mock service calls
    const spies = getSpies();
    // before test entities are not in store
    let entity = await wwsRetailStore.getArtikelInventurQuickInfoState().pipe(take(1)).toPromise();
    expect(entity).toBeUndefined();
    let articleStockInfoSimpleEntity = await wwsRetailStore.getArticleStockInfoSimpleState().pipe(take(1)).toPromise();
    expect(articleStockInfoSimpleEntity).toBeUndefined();

    // test
    const criteria = new WWSRetailServiceNS.ArtikelInventurQuickInfoCriteria();
    const state = articleInfoStateMachine.sendEventArticleInfo(criteria);

    // assert state changed
    expect(state).toBeDefined();
    // assert service is called
    expect(spies.wwsRetailService_getArtikelInventurQuickInfoByCriteria).toBeCalledTimes(1);
    // assert entities are in store
    entity = await wwsRetailStore.getArtikelInventurQuickInfoState().pipe(take(1)).toPromise();
    expect(entity.response).toEqual([articleInventur]);
    articleStockInfoSimpleEntity = await wwsRetailStore.getArticleStockInfoSimpleState().pipe(take(1)).toPromise();
    expect(articleStockInfoSimpleEntity.response).toEqual(articleStockInfoSimple);
  });

  it('sendEventArticleInfo(): throws error', async () => {
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
    const state = articleInfoStateMachine.sendEventArticleInfo(criteria);

    // assert state changed back to idle
    expect(state.value).toEqual(StateMachineStates.IDLE);
    // assert last event contains error
    expect(state.history.event.payload.error).toEqual(error);
  });
});
