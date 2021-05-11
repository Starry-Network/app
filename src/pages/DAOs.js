import { Fragment } from "react";
import {
  Center,
  LinkBox,
  Heading,
  Text,
  Avatar,
  Flex,
  SimpleGrid,
  SkeletonCircle,
  SkeletonText,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import NanoClamp from "nanoclamp";
import { Link as ReachLink } from "react-router-dom";

import {
  useQuery,
  useQueries,
  QueryClient,
  QueryClientProvider,
} from "react-query";
import { request, gql } from "graphql-request";

const endpoint = process.env.REACT_APP_QUERY_ENDPOINT;
const queryClient = new QueryClient();

function useDaos() {
  return useQuery("daos", async () => {
    const {
      daos: { nodes },
    } = await request(
      endpoint,
      gql`
        query {
          daos {
            nodes {
              id
              metadata
              members(filter: { shares: { greaterThan: "0" } }) {
                totalCount
              }
            }
          }
        }
      `
    );
    console.log("dao nodes", nodes);
    return nodes;
  });
}

function useDaosWithMetadata(data) {
  let daos = data ? data : [];
  return useQueries(
    daos.map(
      (dao) => {
        return {
          queryKey: ["dao", dao.id],
          queryFn: async () => {
            const response = await fetch(
              `https://gateway.ipfs.io/ipfs/${dao.metadata}`
            );
            const metadata = await response.json();
            return {
              id: dao.id,
              membersCount: dao.members.totalCount,
              metadata,
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

const SkeletonDAOCard = () => {
  return (
    <Center py={5}>
      <LinkBox
        role={"group"}
        p={6}
        maxW={"260px"}
        w={"full"}
        bg={useColorModeValue("white", "gray.800")}
        boxShadow={"md"}
        rounded={"lg"}
      >
        <Flex
          direction="row"
          align="center"
          justifyContent="space-between"
          w="full"
        >
          <SkeletonCircle size="10" />
          <SkeletonText noOfLines={1} spacing="4" width="150px" />
        </Flex>

        <SkeletonText py={5} noOfLines={3} spacing="4" />
      </LinkBox>
    </Center>
  );
};

function DAOCard({
  name = "a dao",
  description = "some description",
  members = "1",
  logo = "",
  id = "",
  href = "/DAODetail",
}) {
  return (
    <Center py={5}>
      <LinkBox
        as={ReachLink}
        to={`DAODetail/${id}`}
        role={"group"}
        p={6}
        maxW={"260px"}
        w={"full"}
        bg={useColorModeValue("white", "gray.800")}
        boxShadow={"md"}
        rounded={"lg"}
      >
        <Flex direction="row" align="center" w="full">
          <Avatar
            size="md"
            name={`${name}`}
            src={Boolean(logo) ? `https://gateway.ipfs.io/ipfs/${logo}` : ""}
          />
          <Heading ml={4} fontSize="xl" noOfLines="1">
            {name}
          </Heading>
        </Flex>
        <Text py={5} color={"gray.500"} noOfLines="2">
          {description}
        </Text>
        <Text>{members} Members</Text>
      </LinkBox>
    </Center>
  );
}

const Cards = () => {
  const { status, data, error } = useDaos();
  const daos = useDaosWithMetadata(data);
  console.log(data, status, error, daos);

  return (
    <>
      {status !== "success" ? (
        <Center>
          <Spinner mt="10" />
        </Center>
      ) : (
        <SimpleGrid minChildWidth="280px" py={12}>
          {daos.map(({ data, isIdle, isLoading, isError }, index) => (
            <Fragment key={index}>
              {isIdle || isLoading || isError ? (
                <SkeletonDAOCard />
              ) : (
                <DAOCard
                  id={data.id}
                  name={data.metadata.name}
                  description={data.metadata.description}
                  logo={data.metadata.asset}
                  members={data.membersCount}
                />
              )}
            </Fragment>
          ))}
        </SimpleGrid>
      )}
    </>
  );
};

export default function DAOs() {
  return (
    <QueryClientProvider client={queryClient}>
      <Cards />
    </QueryClientProvider>
  );
}
