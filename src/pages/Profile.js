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
            fetch(`https://gateway.ipfs.io/ipfs/${nft.uri}`)
              .then((res) => res.json())
              .then((metadata) => {
                return {
                  nftData: nft,
                  metadata,
                };
              }),
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

  console.log(nfts);
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
                      url={`https://gateway.ipfs.io/ipfs/${nft.data.metadata.asset}`}
                      title={nft.data.metadata.name}
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
            <TabPanel>
              <Tokens accounts={accounts} />
            </TabPanel>
            <TabPanel>
              <p>two!</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </QueryClientProvider>
    </Container>
  );
}
