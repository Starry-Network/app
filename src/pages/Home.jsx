import { Fragment } from "react";
import { useToast, SimpleGrid, Spinner, Text, Center } from "@chakra-ui/react";
import { stringToHex } from "@polkadot/util";

import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "react-query";
import { request, gql } from "graphql-request";

import { useApi } from "../hooks/api";
import { useTransaction } from "../hooks/transaction";
// import TokenCard from "../components/TokenCard";
import { TokenCard, SkeletonCard } from "../components/TokenCard";

const endpoint = process.env.REACT_APP_QUERY_ENDPOINT;
const queryClient = new QueryClient();

function useOrders() {
  return useQuery("orders", async () => {
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
  });
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

  console.log(status, data, error)
  const orderWithNFTs = useOrdersWithNFTs(data);

  console.log(orderWithNFTs);
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
  const toast = useToast();

  console.log(stringToHex("qaq"));
  const { api, accounts, modules, ready } = useApi();
  const newTransaction = useTransaction({
    api,
    accounts,
    modules,
    toast,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Cards />
      {/* <SimpleGrid minChildWidth="280px" py={12}>
        <TokenCard />
        <TokenCard url="https://ipfs.rarible.com/ipfs/QmP4rvmwRcx7mUKAKhtLgfjNi11F5kEQAXxB3CFZp6Kz3c/image.jpeg" />
        <TokenCard url="https://lh3.googleusercontent.com/NNf1COFJ0u8WNyteepk192LxFe-HwFThj5j4dP4whcyUixB2ItuD1cTt5NBOnGjHTZc0JmmjVI47sH79elDI-kex=s250" />
        <TokenCard url="https://lh3.googleusercontent.com/NNf1COFJ0u8WNyteepk192LxFe-HwFThj5j4dP4whcyUixB2ItuD1cTt5NBOnGjHTZc0JmmjVI47sH79elDI-kex=s250" />
        <TokenCard url="https://lh3.googleusercontent.com/NNf1COFJ0u8WNyteepk192LxFe-HwFThj5j4dP4whcyUixB2ItuD1cTt5NBOnGjHTZc0JmmjVI47sH79elDI-kex=s250" />
        <TokenCard url="https://images.unsplash.com/photo-1518051870910-a46e30d9db16?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1350&q=80" />
        <TokenCard url="https://lh3.googleusercontent.com/NNf1COFJ0u8WNyteepk192LxFe-HwFThj5j4dP4whcyUixB2ItuD1cTt5NBOnGjHTZc0JmmjVI47sH79elDI-kex=s250" />
        <TokenCard url="https://d7hftxdivxxvm.cloudfront.net?resize_to=fit&src=http%3A%2F%2Ffiles.artsy.net%2Fimages%2Fthumbnails%2Fpost-war.png&width=357&height=175&quality=80" />{" "}
      </SimpleGrid> */}
    </QueryClientProvider>
  );
}

export default Home;