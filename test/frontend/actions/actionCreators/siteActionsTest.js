import { expect } from "chai";
import {
  sitesReceived, sitesReceivedType,
  siteAdded, siteAddedType,
  siteUpdated, siteUpdatedType,
  siteDeleted, siteDeletedType,
  siteBranchesReceived, siteBranchesReceivedType,
  siteInvalid, siteInvalidType,
  siteLoading, siteLoadingType
} from "../../../../frontend/actions/actionCreators/siteActions";

describe("siteActions actionCreators", () => {
  describe("sitesReceived", () => {
    it("constructs properly", () => {
      const sites = [{
        something: "here"
      }];

      const actual = sitesReceived(sites);

      expect(actual).to.deep.equal({
        type: sitesReceivedType,
        sites
      });
    });

    it("exports its type", () => {
      expect(sitesReceivedType).to.equal("SITES_RECEIVED");
    });
  });

  describe("siteAdded", () => {
    it("constructs properly", () => {
      const site = {
        something: "here"
      };

      const actual = siteAdded(site);

      expect(actual).to.deep.equal({
        type: siteAddedType,
        site
      });
    });

    it("exports its type", () => {
      expect(siteAddedType).to.equal("SITE_ADDED");
    });
  });

  describe("siteUpdated", () => {
    it("constructs properly", () => {
      const id = "tk421";
      const site = {
        something: "here",
        id: id
      };

      const actual = siteUpdated(site);

      expect(actual).to.deep.equal({
        type: siteUpdatedType,
        siteId: id,
        site
      });
    });

    it("exports its type", () => {
      expect(siteUpdatedType).to.equal("SITE_UPDATED");
    });
  });

  describe("siteDeleted", () => {
    it("constructs properly", () => {
      const siteId = "tk421";

      const actual = siteDeleted(siteId);

      expect(actual).to.deep.equal({
        type: siteDeletedType,
        siteId
      });
    });

    it("exports its type", () => {
      expect(siteDeletedType).to.equal("SITE_DELETED");
    });
  });

  describe("siteBranchesReceived", () => {
    it("constructs properly", () => {
      const siteId = "tk421";
      const branches = {
        something: "could be anything",
        except: "when it isn't"
      };

      const actual = siteBranchesReceived(siteId, branches);

      expect(actual).to.deep.equal({
        type: siteBranchesReceivedType,
        siteId,
        branches
      });
    });

    it("exports its type", () => {
      expect(siteBranchesReceivedType).to.equal("SITE_BRANCHES_RECEIVED");
    });
  });

  describe('siteInvalid', () => {
    it('constructs properly', () => {
      const site = {
        id: 1,
        name: 'hotseatcantsitdown'
      };
      const invalid = true;

      const actual = siteInvalid(site, invalid);

      expect(actual).to.deep.equal({
        type: siteInvalidType,
        site,
        invalid
      });
    });

    it ('exports its type', () => {
      expect(siteInvalidType).to.equal('SITE_INVALID');
    });
  });

  describe('siteLoading', () => {
    it('constructs properly', () => {
      const site = {
        id: 1,
        name: 'hotseatcantsitdown'
      };
      const loading = false;

      const actual = siteLoading(site, false);

      expect(actual).to.deep.equal({
        type: siteLoadingType,
        site,
        loading
      });
    });

    it ('exports its type', () => {
      expect(siteLoadingType).to.equal('SITE_LOADING');
    });
  });

});
