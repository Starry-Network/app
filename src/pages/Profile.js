import { Fragment, useState, useEffect } from "react";
import {
  Flex,
  Spacer,
  Container,
  Center,
  Button,
  Box,
  Avatar,
  Image,
  Divider,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Spinner,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Stack,
  HStack,
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
  Switch,
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
import { useForm, FormProvider } from "react-hook-form";

import { SkeletonCard, TokenCard } from "../components/TokenCard";

import { useApi } from "../hooks/api";

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
          {nfts.map((nft, index) => {
            return (
              <Fragment key={index}>
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
                        console.log("qaq");
                      }}
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

const BurnNFT = ({ showPrice }) => {
  const methods = useForm();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  const onSubmit = (values) => {
    console.log(values);
  };

  return (
    <FormProvider {...methods}>
      <FormLabel>Burn NFT</FormLabel>
      <Divider />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack mt="5" spacing={4}>
          <FormControl isInvalid={errors.amount}>
            <FormLabel>Amount</FormLabel>
            <NumberInput defaultValue={1} min={1}>
              <NumberInputField {...register("amount", { required: true })} />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormErrorMessage>
              {errors.amount && "amount is required"}
            </FormErrorMessage>
          </FormControl>
        </Stack>
        <Flex mt="5">
          <Spacer />
          <Box>
            <Button
              type="submit"
              mr={3}
              bg="gray.900"
              color="white"
              _hover={{
                bg: "purple.550",
              }}
            >
              Burn
            </Button>
            <Button
              type="reset"
              onClick={() => {
                // setShowTransfer(false)
                showPrice();
                reset("", {
                  keepValues: false,
                });
              }}
            >
              Cancel
            </Button>
          </Box>
        </Flex>
      </form>
    </FormProvider>
  );
};

const TransferNFT = ({ showPrice }) => {
  const methods = useForm();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  const onSubmit = (values) => {
    console.log(values);
  };

  return (
    <FormProvider {...methods}>
      <FormLabel>Transfer NFT</FormLabel>
      <Divider />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack mt="5" spacing={4}>
          <FormControl isInvalid={errors.receriver}>
            <FormLabel htmlFor="receriver">Receiver address</FormLabel>
            <Input
              name="receriver"
              placeholder="Receiver address"
              {...register("receriver", { required: true })}
            />
            <FormErrorMessage>
              {errors.receriver && "Receriver is required"}
            </FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={errors.amount}>
            <FormLabel>Amount</FormLabel>
            <NumberInput defaultValue={1} min={1}>
              <NumberInputField {...register("amount", { required: true })} />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormErrorMessage>
              {errors.amount && "amount is required"}
            </FormErrorMessage>
          </FormControl>
        </Stack>
        <Flex mt="5">
          <Spacer />
          <Box>
            <Button
              type="submit"
              mr={3}
              bg="gray.900"
              color="white"
              _hover={{
                bg: "purple.550",
              }}
            >
              Create
            </Button>
            <Button
              type="reset"
              onClick={() => {
                showPrice();
                reset("", {
                  keepValues: false,
                });
              }}
            >
              Cancel
            </Button>
          </Box>
        </Flex>
      </form>
    </FormProvider>
  );
};

const SetPrice = () => {
  const [showSetPrice, setShowSetPrice] = useState(false);
  const methods = useForm();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  const onSubmit = (values) => {
    console.log(values);
  };
  return (
    <>
      <FormControl display="flex" alignItems="center" mt="5">
        <FormLabel htmlFor="email-alerts" mb="0">
          Set price
        </FormLabel>
        <Switch
          size="lg"
          colorScheme="black"
          onChange={(e) => setShowSetPrice(e.target.checked)}
        />
      </FormControl>
      <form onSubmit={handleSubmit(onSubmit)}>
        {showSetPrice ? (
          <Stack mt="5" spacing={4}>
            <FormControl isInvalid={errors.amount}>
              <FormLabel>Amount</FormLabel>
              <NumberInput defaultValue={1} min={1}>
                <NumberInputField {...register("amount", { required: true })} />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>
                {errors.amount && "amount is required"}
              </FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={errors.price}>
              <FormLabel>Price</FormLabel>
              <NumberInput defaultValue={1} min={0}>
                <NumberInputField {...register("price", { required: true })} />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>
                {errors.price && "price is required"}
              </FormErrorMessage>
            </FormControl>
          </Stack>
        ) : null}
        <Box mt="5">
          <Button
            w="full"
            type="submit"
            mr={3}
            bg="gray.900"
            color="white"
            _hover={{
              bg: "purple.550",
            }}
          >
            Set price
          </Button>
        </Box>
      </form>
    </>
  );
};

const ActionModal = ({ isOpen, onClose }) => {
  // const [showTransfer, setShowTransfer] = useState(false);
  // const [showBurn, setShowBurn] = useState(false);
  const [showComponent, setShowComponent] = useState("price");

  const showTransfer = () => setShowComponent("transfer");
  const showPrice = () => setShowComponent("price");
  const showBurn = () => setShowComponent("burn");

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>NFT Title</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Center>
            <Image
              rounded={"lg"}
              boxSize="160px"
              objectFit="contain"
              src={
                "https://lh3.googleusercontent.com/1_I7m72fLjas0kXfjYQ8p44gUhi5yMNYgi67t6gGu8ZCM5Z0zcwUAoRNYTlCnwgc1dDGeX4lnzgTfKfNTyJMtcI7trmA8TL32ked=s250"
              }
            />
          </Center>
          {showComponent === "price" ? (
            <HStack mt="5" spacing="5">
              <Button
                w="full"
                bg="gray.900"
                borderRadius="none"
                color="white"
                _hover={{
                  bg: "purple.550",
                }}
                onClick={() => showTransfer()}
              >
                Transfer
              </Button>
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
                onClick={() => showBurn()}
              >
                Burn
              </Button>
            </HStack>
          ) : null}
          {(() => {
            switch (showComponent) {
              case "price":
                return <SetPrice />;
              case "transfer":
                return <TransferNFT showPrice={showPrice} />;
              case "burn":
                return <BurnNFT showPrice={showPrice} />;
              default:
                return <SetPrice />;
            }
          })()}
          {/* {showTransfer ? (
            <TransferNFT setShowTransfer={setShowTransfer} />
          ) : null} */}
        </ModalBody>

        {/* <ModalFooter>
          <Button
            mr={3}
            bg="gray.900"
            color="white"
            _hover={{
              bg: "purple.550",
            }}
          >
            Create
          </Button>
          <Button
            type="reset"
            onClick={() => {
              onClose();
            }}
          >
            Cancel
          </Button>
        </ModalFooter> */}
      </ModalContent>
    </Modal>
  );
};

export default function Profile() {
  const { api, accounts, modules, ready } = useApi();
  const { isOpen, onOpen, onClose } = useDisclosure();

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
              {/* <Tokens accounts={accounts} /> */}
              <SimpleGrid minChildWidth="280px">
                <TokenCard
                  disableLink={true}
                  onClick={(e) => {
                    onOpen();
                    console.log("qaq");
                  }}
                />
              </SimpleGrid>
            </TabPanel>
            <TabPanel>
              <p>two!</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
        <ActionModal isOpen={isOpen} onClose={onClose} />
      </QueryClientProvider>
    </Container>
  );
}
