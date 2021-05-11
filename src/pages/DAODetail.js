import {
  Avatar,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  Grid,
  Spacer,
  Stack,
  HStack,
  Center,
  SkeletonCircle,
  SkeletonText,
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
import { useParams } from "react-router-dom";

import { request, gql } from "graphql-request";
import { useForm, FormProvider } from "react-hook-form";

import { useApi } from "../hooks/api";
import { useTransaction } from "../hooks/transaction";

const endpoint = process.env.REACT_APP_QUERY_ENDPOINT;
const queryClient = new QueryClient();

function useDaoWithMetadata(daoId) {
  return useQuery(
    "dao",
    async () => {
      const { dao } = await request(
        endpoint,
        gql`
          query {
            dao(id: "${daoId}") {
              metadata
              totalShares
              members {
                totalCount
              }
              proposals {
                totalCount
                nodes {
                  id
                  details
                }
              }
            }
          }
        `
      );
      // return dao
      const response = await fetch(
        `https://gateway.ipfs.io/ipfs/${dao.metadata}`
      );
      const metadata = await response.json();
      return {
        ...dao,
        metadata,
      };
    },
    {
      enabled: !!daoId,
    }
  );
}

const SkeletonProposal = () => (
  <Flex flexDir="row" flex="5" boxShadow="md" rounded="lg">
    <Flex flex="4" px="5" minH="100px" flexDir="column" justify="space-around">
      <SkeletonText noOfLines={1} spacing="4" width="260px" />
      <HStack>
        <SkeletonText noOfLines={1} spacing="4" width="150px" />
      </HStack>
    </Flex>
    <Flex flex="1">
      <Spacer />
    </Flex>
  </Flex>
);

const SkeletonDAOWithProposals = () => (
  <>
    <Box w="full" p="6" boxShadow="md" rounded="lg" minH="150px">
      {/* QAQ */}
      <Flex direction="row" align="center" w="full">
        <SkeletonCircle size="10" />
        <SkeletonText ml="5" width="280px" noOfLines={1} spacing="4" />
        <Spacer />
      </Flex>
      <SkeletonText mt="5" ml={4} noOfLines={4} spacing="4" />
    </Box>
    <Stack py="10">
      <SkeletonProposal />
    </Stack>
  </>
);

const Proposal = () => {
  return (
    <Flex flexDir="row" flex="5" boxShadow="md" rounded="lg">
      <Flex
        flex="4"
        px="5"
        minH="100px"
        flexDir="column"
        justify="space-around"
      >
        <Text fontWeight="bold">A Proposal Title</Text>
        <HStack>
          <Text>2 Yes</Text>
          <Text>3 No</Text>
        </HStack>
      </Flex>
      <Flex flex="1">
        <Center w="full">
          <Button>Vote</Button>
        </Center>
      </Flex>
    </Flex>
  );
};

const DAOInfoCard = ({ name, description, asset, members, shares }) => {
  return (
    <Box w="full" p="6" boxShadow="md" rounded="lg" minH="150px">
      <Flex direction="row" align="center" w="full">
        <Avatar
          size="md"
          name={name}
          src={`https://gateway.ipfs.io/ipfs/${asset}`}
        />
        <Heading ml="4" fontSize="xl" noOfLines="1">
          {name}
        </Heading>
      </Flex>
      <Text py="5" color="gray.500">
        {description}
      </Text>
      <Grid templateColumns="repeat(3, 1fr)" gap={6}>
        <Box w="full">
          <Text fontWeight="bold">Members</Text>
          <Text>{members}</Text>
        </Box>
        <Box w="full">
          <Text fontWeight="bold">Shares</Text>
          <Text>{shares}</Text>
        </Box>
        <Spacer />
      </Grid>
    </Box>
  );
};

const DAOWithProposals = ({ data }) => {
  console.log(data);
  return (
    <>
      <DAOInfoCard
        name={data.metadata.name}
        description={data.metadata.description}
        asset={data.metadata.asset}
        members={data.members.totalCount}
        shares={data.totalShares}
      />
      <Stack py="10">
        {data.proposals.nodes.map(() => (
          <Proposal />
        ))}
      </Stack>
    </>
  );
};

const Detail = ({ daoId }) => {
  const { status, data, error } = useDaoWithMetadata(daoId);

  return (
    <>
      {status !== "success" ? (
        <SkeletonDAOWithProposals />
      ) : (
        <DAOWithProposals data={data} />
      )}
    </>
  );
};

export default function DAODetail() {
  let { daoId } = useParams();

  return (
    <QueryClientProvider client={queryClient}>
      <Container py={12}>
        <Detail daoId={daoId} />
      </Container>
    </QueryClientProvider>
  );
}
