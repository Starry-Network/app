import { Fragment, useState, useEffect } from "react";
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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  IconButton,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";

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
import { urlSource } from "ipfs-http-client";
import { stringToHex } from "@polkadot/util";

import { useApi } from "../hooks/api";
import { useTransaction } from "../hooks/transaction";
import ipfs from "../utils/ipfs";

import Collections from "../components/Collections";

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
              summoningTime
              periodDuration
              votingPeriod
              gracePeriod
              members {
                totalCount
              }
              proposals {
                totalCount
                nodes {
                  id
                  index
                  details
                  noVotes
                  yesVotes
                  sponsored
                  startingPeriod
                  processed
                  didPass
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

function useProposals(data) {
  let proposals = data ? data.proposals.nodes : [];

  return useQueries(
    proposals.map(
      (proposal) => {
        return {
          queryKey: ["proposal", proposal.id],
          queryFn: async () => {
            const response = await fetch(
              `https://gateway.ipfs.io/ipfs/${proposal.details}`
            );
            const metadata = await response.json();
            return {
              ...proposal,
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

const Proposal = ({
  daoId,
  id,
  index,
  title,
  yes = "",
  no = "",
  sponsored = false,
  openVoteModal,
  setIds,
  blockNumber,
  currentPeriod,
  startingPeriod,
  votingPeriod,
  gracePeriod,
  periodDuration,
  processed,
  didPass,
}) => {
  const [endVotingPeriod, setEndVotingPeriod] = useState(0);
  const [endGracePeriod, setEndGracePeriod] = useState(0);

  useEffect(() => {
    if (startingPeriod) {
      setEndVotingPeriod(startingPeriod + votingPeriod);
      setEndGracePeriod(startingPeriod + votingPeriod + gracePeriod);
    }
  }, []);

  const { api, accounts, modules, ready } = useApi();
  const toast = useToast();
  const newTransaction = useTransaction({
    api,
    accounts,
    ready,
    modules,
    toast,
  });

  const sponsor = async () => {
    if (!(accounts && accounts.length > 0)) {
      return toast({
        title: "Error",
        description: "There is no account in wallet",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
    try {
      await newTransaction("nftdaoModule", "sponsorProposal", [
        daoId,
        id.split("-")[1],
      ]);
    } catch (error) {
      toast({
        description: error.toString(),
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      console.log(error);
    }
  };

  const process = async () => {
    if (!(accounts && accounts.length > 0)) {
      return toast({
        title: "Error",
        description: "There is no account in wallet",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
    try {
      await newTransaction("nftdaoModule", "processProposal", [
        daoId,
        id.split("-")[1],
      ]);
    } catch (error) {
      toast({
        description: error.toString(),
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      console.log(error);
    }
  };

  return (
    <Flex flexDir="row" flex="5" boxShadow="md" rounded="lg">
      <Flex
        flex="4"
        px="5"
        minH="100px"
        flexDir="column"
        justify="space-around"
      >
        <Text fontWeight="bold">{title}</Text>
        <HStack>
          <Text>{yes} Yes</Text>
          <Text>{no} No</Text>
        </HStack>
      </Flex>
      <Flex flex="1">
        <Center w="full">
          {(() => {
            if (sponsored) {
              if (startingPeriod > currentPeriod) {
                return (
                  <Button
                    colorScheme="black"
                    onClick={() => {
                      setIds({
                        daoId,
                        index,
                      });
                      openVoteModal();
                    }}
                  >
                    Vote
                  </Button>
                );
              }
              if (
                currentPeriod > startingPeriod &&
                currentPeriod < endVotingPeriod
              ) {
                return (
                  <>
                    after {(endVotingPeriod - currentPeriod) * periodDuration}{" "}
                    blocks close
                  </>
                );
              }
              if (
                currentPeriod > endVotingPeriod &&
                currentPeriod < endGracePeriod
              ) {
                return (
                  <>
                    Grace ends after
                    {(endGracePeriod - currentPeriod) * periodDuration} blocks
                  </>
                );
              } else {
                if (processed) {
                  return <>{didPass ? <>Pass</> : <>Failed</>}</>;
                }
                return (
                  <Button
                    colorScheme="black"
                    onClick={async () => await process()}
                  >
                    Process
                  </Button>
                );
              }
            } else {
              return (
                <Button
                  colorScheme="black"
                  onClick={async () => await sponsor()}
                >
                  Sponsor
                </Button>
              );
            }
          })()}
        </Center>
      </Flex>
    </Flex>
  );
};

const DAOInfoCard = ({
  id,
  name = "a dao",
  description = "some description",
  asset,
  members = "1",
  shares = "1",
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box w="full" p="6" boxShadow="md" rounded="lg" minH="150px">
      <Flex direction="row" align="center" w="full">
        <Avatar
          size="md"
          name={name}
          src={Boolean(asset) ? `https://gateway.ipfs.io/ipfs/${asset}` : null}
        />
        <Heading ml="4" fontSize="xl" noOfLines="1">
          {name}
        </Heading>
      </Flex>
      <Text py="5" color="gray.500">
        {description}
      </Text>
      <Flex w="full">
        <Flex flex="1" justify="start">
          <Box w="full">
            <Text fontWeight="bold">Members</Text>
            <Text>{members}</Text>
          </Box>
          <Box w="full" ml="4">
            <Text fontWeight="bold">Shares</Text>
            <Text>{shares}</Text>
          </Box>
        </Flex>
        <Spacer />
        <Flex flex="1" justify="end">
          <Flex w="full" h="full" align="center" justify="center">
            <Button colorScheme="black" onClick={() => onOpen()}>
              New Proposal
            </Button>
          </Flex>
        </Flex>
      </Flex>
      <NewProposal isOpen={isOpen} onClose={onClose} daoId={id} />
    </Box>
  );
};

const NewProposal = ({ isOpen, onClose, daoId }) => {
  const { api, accounts, modules, ready } = useApi();
  const toast = useToast();
  const newTransaction = useTransaction({
    api,
    accounts,
    ready,
    modules,
    toast,
  });

  const methods = useForm();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  const onSubmit = async (values) => {
    console.log(values);
    if (!(accounts && accounts.length > 0)) {
      return toast({
        title: "Error",
        description: "There is no account in wallet",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
    try {
      let metadata = {
        title: "",
        description: "",
      };

      metadata = {
        ...metadata,
        title: values.title,
        description: values.description,
      };

      toast({
        description: "uploading metadata",
        status: "info",
        duration: 9000,
        isClosable: true,
      });

      const metadataInfo = await ipfs.add(JSON.stringify(metadata));
      const metadataCID = metadataInfo.cid.toString();

      const metadataCIDHash = stringToHex(metadataCID);

      const clonedValues = JSON.parse(JSON.stringify(values));
      Object.keys(clonedValues).forEach((key) => {
        if (clonedValues[key] === "") {
          clonedValues[key] = null;
        }
      });

      const tributeNFT = clonedValues.collection
        ? [clonedValues.collection, clonedValues.startIdx]
        : null;

      const result = await newTransaction("nftdaoModule", "submitProposal", [
        daoId,
        clonedValues.applicant,
        clonedValues.shares,
        clonedValues.tributeOffered,
        tributeNFT,
        metadataCIDHash,
        clonedValues.action,
      ]);

      console.log(metadataCID);
    } catch (error) {
      toast({
        description: error.toString(),
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      console.log(error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalContent>
            <ModalHeader>New Proposal</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Stack spacing={4}>
                <FormControl isInvalid={errors.title}>
                  <FormLabel htmlFor="name">Title</FormLabel>
                  <Input
                    placeholder="Title"
                    {...register("title", { required: true })}
                  />
                  <FormErrorMessage>
                    {errors.title && "Title is required"}
                  </FormErrorMessage>
                </FormControl>

                <FormControl mt={4}>
                  <FormLabel htmlFor="description">Description</FormLabel>
                  <Input
                    placeholder="description"
                    {...register("description")}
                  />
                </FormControl>
                <FormControl isInvalid={errors.applicant}>
                  <FormLabel>Applicant</FormLabel>
                  <Input
                    placeholder="Applicant address"
                    {...register("applicant", { required: true })}
                    defaultValue={
                      accounts && accounts.length > 0
                        ? accounts[0].address
                        : null
                    }
                  />
                  <FormErrorMessage>
                    {errors.applicant && "Applicant is required"}
                  </FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={errors.shares}>
                  <FormLabel>Shares requested</FormLabel>
                  <NumberInput defaultValue={0} min={0}>
                    <NumberInputField
                      {...register("shares", { required: true })}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormErrorMessage>
                    {errors.amount && "shares is required"}
                  </FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={errors.tributeOffered}>
                  <FormLabel>Tribute offered</FormLabel>
                  <NumberInput defaultValue={1} min={0}>
                    <NumberInputField
                      {...register("tributeOffered", { required: true })}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormErrorMessage>
                    {errors.tributeOffered && "Tribute offered is required"}
                  </FormErrorMessage>
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="collection">Collection</FormLabel>
                  <Collections
                    accounts={accounts}
                    {...register("collection")}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>start Idx</FormLabel>
                  <NumberInput defaultValue={0} min={0}>
                    <NumberInputField {...register("startIdx")} />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Action</FormLabel>
                  <Input
                    placeholder="Action encoded bytes"
                    {...register("action")}
                  />
                </FormControl>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button
                mr={3}
                bg="gray.900"
                color="white"
                _hover={{
                  bg: "purple.550",
                }}
                type="submit"
              >
                Submit
              </Button>
              <Button
                type="reset"
                onClick={() => {
                  onClose();
                  reset("", {
                    keepValues: false,
                  });
                }}
              >
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </FormProvider>
    </Modal>
  );
};

const VoteModal = ({ isOpen, onClose, ids }) => {
  const { api, accounts, modules, ready } = useApi();
  const toast = useToast();
  const newTransaction = useTransaction({
    api,
    accounts,
    ready,
    modules,
    toast,
  });

  const vote = async (yes) => {
    console.log(ids);
    try {
      await newTransaction("nftdaoModule", "voteProposal", [
        ids.daoId,
        ids.index,
        yes,
      ]);
    } catch (error) {
      toast({
        description: error.toString(),
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      console.log(error);
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Vote</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Button
            w="full"
            variant="outline"
            bg="white"
            border="2px"
            borderRadius="none"
            borderColor="gray.900"
            _hover={{
              bg: "white",
            }}
            leftIcon={<CheckIcon />}
            onClick={async () => await vote(true)}
          >
            Yes
          </Button>
          <Button
            w="full"
            bg="gray.900"
            borderRadius="none"
            color="white"
            mt="4"
            _hover={{
              bg: "purple.550",
            }}
            leftIcon={<CloseIcon />}
            onClick={async () => await vote(false)}
          >
            No
          </Button>
        </ModalBody>

        <ModalFooter />
      </ModalContent>
    </Modal>
  );
};

const DAOWithProposals = ({ data, daoId }) => {
  const [ids, setIds] = useState({
    daoId: "",
    index: "",
  });
  const proposals = useProposals(data);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { api } = useApi();
  const [blockNumber, setBlockNumber] = useState(0);
  const [currentPeriod, setCurrentPeriod] = useState(0);

  const bestNumber = api ? api.derive.chain.bestNumber : null;

  useEffect(() => {
    if (bestNumber) {
      let unsubscribeAll = null;

      const summoningTime = data.summoningTime;
      const periodDuration = data.periodDuration;

      bestNumber((number) => {
        const now = number.toNumber();
        setBlockNumber(now);
        const period = (now - summoningTime) / periodDuration;
        setCurrentPeriod(period);
      })
        .then((unsub) => {
          unsubscribeAll = unsub;
        })
        .catch(console.error);

      return () => unsubscribeAll && unsubscribeAll();
    }
  }, [bestNumber]);

  console.log(proposals);

  return (
    <>
      <DAOInfoCard
        id={daoId}
        name={data.metadata.name}
        description={data.metadata.description}
        asset={data.metadata.asset}
        members={data.members.totalCount}
        shares={data.totalShares}
      />
      <Stack py="10">
        <VoteModal isOpen={isOpen} onClose={onClose} ids={ids} />

        {proposals.map(({ isLoading, data: proposal }, index) => (
          <Fragment key={index}>
            {isLoading ? (
              <SkeletonDAOWithProposals />
            ) : (
              <Proposal
                daoId={daoId}
                id={proposal.id}
                index={proposal.index}
                setIds={setIds}
                title={proposal.metadata.title}
                yes={proposal.yesVotes}
                no={proposal.noVotes}
                sponsored={proposal.sponsored}
                openVoteModal={onOpen}
                blockNumber={blockNumber}
                currentPeriod={currentPeriod}
                processed={proposal.processed}
                didPass={proposal.didPass}
                startingPeriod={Number(proposal.startingPeriod)}
                votingPeriod={Number(data.votingPeriod)}
                gracePeriod={Number(data.gracePeriod)}
                periodDuration={Number(data.periodDuration)}
              />
            )}
          </Fragment>
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
        <DAOWithProposals data={data} daoId={daoId} />
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
