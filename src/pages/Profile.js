import {
  Flex,
  Container,
  Avatar,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Spinner,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
} from "@chakra-ui/react";
import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "react-query";
import { request, gql } from "graphql-request";

import { SkeletonCard, TokenCard } from "../components/TokenCard";

import { useApi } from "../utils/api";
import { useEffect } from "react";

const endpoint = process.env.REACT_APP_QUERY_ENDPOINT;
const queryClient = new QueryClient();

function useNFTs(accounts) {
  const address = accounts && accounts.length > 0 ? accounts[0].address : null;

  return useQuery(
    "nfts",
    async () => {
      const {
        nfts: { nodes },
      } = await request(
        endpoint,
        gql`
        query {
          nfts(
            filter: {
              owner: {
                equalTo: "${address}"
              }
            }
          ) {
            nodes {
              id
              owner
              isSub
              uri
            }
          }
        }
      `
      );
      console.log("nft nodes", nodes);
      return nodes;
    },
    {
      enabled: !!address,
    }
  );
}

function useNFTMetadatas(data) {
  // const enable = nfts && nfts.length >= 0;
  let nfts = data ? data : [];
  return useQueries(
    nfts.map(
      (nft) => {
        return {
          queryKey: ["nft", nft.id],
          queryFn: () =>
            fetch(`https://gateway.ipfs.io/ipfs/${nft.uri}`).then((res) =>
              res.json()
            ),
        };
      },
      {
        enabled: data && data.length >= 0,
      }
    )
  );
}


const Tokens = ({ accounts }) => {
  const { status, data, error } = useNFTs(accounts);

  const nfts = useNFTMetadatas(data);

  console.log(nfts)
  return (
    <>
      {status === "loading" || status === "idle" ? (
        <Spinner />
      ) : status === "error" ? (
        <Text>{`Error: ${error.message}`}</Text>
      ) : (
        <SimpleGrid minChildWidth="280px">
          {nfts.map((nft) => {
            return (
              <>
                {nft.isIdle || nft.isLoading ? (
                  <>
                    <SkeletonCard />
                  </>
                ) : (
                  <>
                    <TokenCard
                      url={`https://gateway.ipfs.io/ipfs/${nft.data.asset}`}
                      title={nft.data.name}
                      disableLink={true}
                      onClick={(e) => {
                        e.persist();
                        e.nativeEvent.stopImmediatePropagation();
                        e.stopPropagation();
                        alert("qaq");
                        console.log("qaq");
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                      }}
                    />
                  </>
                )}
              </>
            );
          })}
        </SimpleGrid>
      )}
    </>
  );
};

export default function Profile() {
  const { api, accounts, modules, ready } = useApi();

  return (
    <Container py={12} maxW="container.lg">
      <QueryClientProvider client={queryClient}>
        <Flex flexDir="column" justify="center" align="center">
          <Avatar
            size="xl"
            name="Dan Abrahmov"
            src="https://bit.ly/dan-abramov"
          />
          <Heading align="center" fontSize="xl" mt="5">
            Dan Abrahmov
          </Heading>
        </Flex>
        <Tabs isLazy colorScheme="grey">
          <TabList>
            <Tab>Tokens</Tab>
            <Tab>Collectoins</Tab>
          </TabList>
          <TabPanels>
            {/* initially mounted */}
            <TabPanel>
              <Tokens accounts={accounts} />
              {/* <p>one!</p> */}
              {/* <SimpleGrid minChildWidth="280px">
                <TokenCard
                  disableLink={true}
                  onClick={(e) => {
                    e.persist();
                    e.nativeEvent.stopImmediatePropagation();
                    e.stopPropagation();
                    alert("qaq");
                    console.log("qaq");
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }}
                />
                <TokenCard url="https://ipfs.rarible.com/ipfs/QmP4rvmwRcx7mUKAKhtLgfjNi11F5kEQAXxB3CFZp6Kz3c/image.jpeg" />
                <TokenCard url="https://lh3.googleusercontent.com/NNf1COFJ0u8WNyteepk192LxFe-HwFThj5j4dP4whcyUixB2ItuD1cTt5NBOnGjHTZc0JmmjVI47sH79elDI-kex=s250" />
                <TokenCard url="https://lh3.googleusercontent.com/NNf1COFJ0u8WNyteepk192LxFe-HwFThj5j4dP4whcyUixB2ItuD1cTt5NBOnGjHTZc0JmmjVI47sH79elDI-kex=s250" />
                <TokenCard url="https://lh3.googleusercontent.com/NNf1COFJ0u8WNyteepk192LxFe-HwFThj5j4dP4whcyUixB2ItuD1cTt5NBOnGjHTZc0JmmjVI47sH79elDI-kex=s250" />
                <TokenCard url="https://images.unsplash.com/photo-1518051870910-a46e30d9db16?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1350&q=80" />
                <TokenCard url="https://lh3.googleusercontent.com/NNf1COFJ0u8WNyteepk192LxFe-HwFThj5j4dP4whcyUixB2ItuD1cTt5NBOnGjHTZc0JmmjVI47sH79elDI-kex=s250" />
                <TokenCard url="https://d7hftxdivxxvm.cloudfront.net?resize_to=fit&src=http%3A%2F%2Ffiles.artsy.net%2Fimages%2Fthumbnails%2Fpost-war.png&width=357&height=175&quality=80" />{" "}
              </SimpleGrid> */}
            </TabPanel>
            {/* initially not mounted */}
            <TabPanel>
              <p>two!</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </QueryClientProvider>
    </Container>
  );
}
