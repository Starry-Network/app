import { Fragment } from "react";
import { SimpleGrid, Spinner, Text, Center } from "@chakra-ui/react";

import {
  useQuery,
  useQueries,
  QueryClient,
  QueryClientProvider,
} from "react-query";
import { request, gql } from "graphql-request";

import { TokenCard, SkeletonCard } from "../components/TokenCard";

const endpoint = process.env.REACT_APP_QUERY_ENDPOINT;
const queryClient = new QueryClient();

function useOrders() {
  return useQuery(
    "orders",
    async () => {
      const {
        orders: { nodes },
      } = await request(
        endpoint,
        gql`
          query {
            orders {
              nodes {
                id
                amount
                seller
                nftId
                price
              }
            }
          }
        `
      );
      console.log("order nodes", nodes);
      return nodes;
    },
    {
      refetchInterval: 1000,
    }
  );
}

function useOrdersWithNFTs(data) {
  let orders = data ? data : [];
  return useQueries(
    orders.map(
      (order) => {
        return {
          queryKey: ["order", order.id],
          queryFn: async () => {
            const { nft } = await request(
              endpoint,
              gql`
                query {
                  nft(id: "${order.nftId}") {
                    id
                    owner
                    uri
                  }
                }
              `
            );
            const response = await fetch(
              `https://gateway.ipfs.io/ipfs/${nft.uri}`
            );
            const metadata = await response.json();
            return {
              metadata,
              order,
            };
          },
        };
      },
      {
        enabled: data && data.length >= 0,
      }
    )
  );
}

const Cards = () => {
  const { status, data, error } = useOrders();
  const orderWithNFTs = useOrdersWithNFTs(data);

  return (
    <>
      {status === "loading" || status === "idle" ? (
        <Center>
          <Spinner mt="10" />
        </Center>
      ) : status === "error" ? (
        <Text>{`Error: ${error.message}`}</Text>
      ) : (
        <SimpleGrid minChildWidth="280px" py={12}>
          {orderWithNFTs.map(({ data, isIdle, isLoading, isError }, index) => {
            return (
              <Fragment key={index}>
                {isIdle || isLoading || isError ? (
                  <>
                    <SkeletonCard key={index} />
                  </>
                ) : (
                  <>
                    <TokenCard
                      key={index}
                      url={`https://gateway.ipfs.io/ipfs/${data.metadata.asset}`}
                      title={data.metadata.name}
                      amount={data.order.amount}
                      price={data.order.price}
                      href={`/NFTDetail/${data.order.nftId}/${data.order.id}`}
                      // href={`/NFTDetail/${data.order.nftId}/null`}
                    />
                  </>
                )}
              </Fragment>
            );
          })}
        </SimpleGrid>
      )}
    </>
  );
};

function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <Cards />
    </QueryClientProvider>
  );
}

export default Home;
