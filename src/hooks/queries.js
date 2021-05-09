import { request, gql } from "graphql-request";

import { useQuery } from "react-query";

const endpoint = process.env.REACT_APP_QUERY_ENDPOINT;

export function useCollections(accounts, isSub = false) {
  const address = accounts && accounts.length > 0 ? accounts[0].address : null;

  return useQuery(
    "collections",
    async () => {
      const {
        collections: { nodes },
      } = await request(
        endpoint,
        gql`
            query {
              collections(
                filter: {
                  owner: {
                    equalTo: "${address}"
                  }
                  isSub: {
                    equalTo: ${isSub}
                  }
                }
              ) {
                nodes {
                  id
                }
              }
            }
        `
      );
      const data = nodes.map((collection) => {
        return { label: collection.id, value: collection.id };
      });
      console.log(nodes);
      return data;
    },
    {
      // enabled: enable,
      enabled: !!address,
    }
  );
}
