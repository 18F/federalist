import { expect } from 'chai';
import { getOrgById, orgFilter } from '../../../frontend/selectors/organization';

describe('organzizationSelectors', () => {
  const state = {
    data: [
      { id: 1, name: 'org-1' },
      { id: 2, name: 'org-2' },
    ],
  };

  describe('.getOrgById', () => {
    it('returns the org for the given id', () => {
      const site = getOrgById(state, '2');
      expect(site).to.eq(state.data[1]);
    });

    it('returns the null if there is not an organization for the given id', () => {
      const site = getOrgById(state, '4');
      expect(site).to.be.undefined;
    });
  });

  describe('.orgFilter', () => {
    it('returns array of objects with id and name while adding the "All" and "Unassociated" options', () => {
      const grouped = orgFilter(state);
      expect(grouped[0]).to.deep.equal({ id: 'all-options', name: 'All' });
      expect(grouped[grouped.length - 1]).to.deep.equal({
        id: 'unassociated',
        name: 'Sites without an organization',
      });
      grouped.map(group => expect(group).to.have.keys(['id', 'name']));
    });

    it('returns null if there is not organizations', () => {
      const noOrganizations = {};
      const grouped = orgFilter(noOrganizations);
      expect(grouped).to.be.null;
    });
  });
});
