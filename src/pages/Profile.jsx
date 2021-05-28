import { Fragment, useState } from "react";
import {
  Flex,
  Spacer,
  Container,
  Center,
  Button,
  Box,
  Image,
  Divider,
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
  ModalBody,
  ModalCloseButton,
  Stack,
  HStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  SkeletonCircle,
  SkeletonText,
  useToast,
} from "@chakra-ui/react";
import {
  useQuery,
  useQueries,
  QueryClient,
  QueryClientProvider,
} from "react-query";
import { request, gql } from "graphql-request";
import { useForm, FormProvider } from "react-hook-form";
import Identicon from "@polkadot/react-identicon";
import { ReactQueryDevtools } from 'react-query/devtools'

import { SkeletonCard, TokenCard } from "../components/TokenCard";

import { useApi } from "../hooks/api";
import { useTransaction } from "../hooks/transaction";

const endpoint = process.env.REACT_APP_QUERY_ENDPOINT;
const queryIntervalMs = process.env.REACT_QUERY_INTERVAL_MS;
const queryClient = new QueryClient();

function useNFTs(accounts, isSub = false, isGraph = false) {
  const address = accounts && accounts.length > 0 ? accounts[0].address : null;

  const query = gql`
    query {
      nfts(
        filter: {
          owner: { equalTo: "5CMDe6aVXnQeAuyq2CP7Ky34wA5zucCQzgSWvESjSGAGLVAy" }
          isSub: {equalTo: ${isSub}}
          isRoot: { equalTo: ${isGraph} }
          parentId: { isNull: true }
        }
      ) {
        nodes {
          id
          endIdx
          owner
          isSub
          uri
        }
      }
    }
  `;

  return useQuery(
    "nfts",
    async () => {
      const {
        nfts: { nodes },
      } = await request(endpoint, query);
      console.log("nft nodes", nodes);
      return nodes;
    },
    {
      enabled: !!address,
      refetchInterval: queryIntervalMs,
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
        refetchInterval: queryIntervalMs,
      }
    )
  );
}

const RandomAvatar = ({ address }) => {
  const size = 32;
  const theme = "substrate";

  return <Identicon value={address} size={size} theme={theme} />;
};

const Tokens = ({
  accounts,
  isSub = false,
  isGraph = false,
  setNFTMetada,
  openActionModal,
}) => {
  const { status, data, error } = useNFTs(accounts, isSub, isGraph);

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
                      amount={
                        Number(nft.data.nftData.endIdx) -
                        Number(nft.data.nftData.id.split("-")[1]) +
                        1
                      }
                      disableLink={true}
                      onClick={(e) => {
                        // console.log("qaq");
                        const token = nft.data.nftData.id.split("-");
                        setNFTMetada({
                          collectionId: token[0],
                          startIdx: token[1],
                          name: nft.data.metadata.name,
                          uri: nft.data.metadata.asset,
                        });
                        openActionModal();
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

const BurnNFT = ({ showPrice, collectionId, startIdx }) => {
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
    reset,
    formState: { errors },
  } = methods;

  const onSubmit = async (values) => {
    console.log(values);
    if (!(accounts && accounts.length > 0)) {
      return toast({
        title: "Error",
        description: "There is no account in wallet",
        status: "error",
        duration: 9000,
        position: "top-right",
        isClosable: true,
      });
    }

    try {
      await newTransaction("nftModule", "burnNonFungible", [
        collectionId,
        startIdx,
        values.amount,
      ]);
      showPrice();
    } catch (error) {
      toast({
        description: error.toString(),
        status: "error",
        duration: 9000,
        position: "top-right",
        isClosable: true,
      });
      console.log(error);
    }
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

const TransferNFT = ({ showPrice, collectionId, startIdx }) => {
  const { api, accounts, modules, ready } = useApi();

  const methods = useForm();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

  const toast = useToast();
  const newTransaction = useTransaction({
    api,
    accounts,
    ready,
    modules,
    toast,
  });

  const onSubmit = async (values) => {
    console.log(values);
    if (!(accounts && accounts.length > 0)) {
      return toast({
        title: "Error",
        description: "There is no account in wallet",
        status: "error",
        duration: 9000,
        position: "top-right",
        isClosable: true,
      });
    }

    try {
      await newTransaction("nftModule", "transferNonFungible", [
        values.receriver,
        collectionId,
        startIdx,
        values.amount,
      ]);
      showPrice();
    } catch (error) {
      toast({
        description: error.toString(),
        status: "error",
        duration: 9000,
        position: "top-right",
        isClosable: true,
      });
      console.log(error);
    }
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
              Transfer
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

const SetPrice = ({ collectionId, startIdx }) => {
  const { api, accounts, modules, ready } = useApi();

  const [showSetPrice, setShowSetPrice] = useState(false);
  const methods = useForm();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  const toast = useToast();
  const newTransaction = useTransaction({
    api,
    accounts,
    ready,
    modules,
    toast,
  });

  const onSubmit = async (values) => {
    if (!(accounts && accounts.length > 0)) {
      return toast({
        title: "Error",
        description: "There is no account in wallet",
        status: "error",
        duration: 9000,
        position: "top-right",
        isClosable: true,
      });
    }

    try {
      const result = await newTransaction("exchangeModule", "sellNft", [
        collectionId,
        startIdx,
        values.amount,
        values.price,
      ]);
      if (result && result.success) {
        setShowSetPrice(false);
      }
    } catch (error) {
      toast({
        description: error.toString(),
        status: "error",
        duration: 9000,
        position: "top-right",
        isClosable: true,
      });
      console.log(error);
    }
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

const ActionModal = ({
  isOpen,
  onClose,
  collectionId,
  startIdx,
  name,
  uri,
}) => {
  const [showComponent, setShowComponent] = useState("price");

  const showTransfer = () => setShowComponent("transfer");
  const showPrice = () => setShowComponent("price");
  const showBurn = () => setShowComponent("burn");

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Center mb="10">
            <Image
              rounded={"lg"}
              boxSize="160px"
              objectFit="contain"
              src={`https://gateway.ipfs.io/ipfs/${uri}`}
            />
          </Center>
          {showComponent === "price" ? (
            <HStack mt="5" spacing="5">
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
                onClick={() => showTransfer()}
              >
                Transfer
              </Button>
              <Button
                w="full"
                bg="gray.900"
                borderRadius="none"
                color="white"
                _hover={{
                  bg: "purple.550",
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
                return (
                  <SetPrice collectionId={collectionId} startIdx={startIdx} />
                );
              case "transfer":
                return (
                  <TransferNFT
                    showPrice={showPrice}
                    collectionId={collectionId}
                    startIdx={startIdx}
                  />
                );
              case "burn":
                return (
                  <BurnNFT
                    showPrice={showPrice}
                    collectionId={collectionId}
                    startIdx={startIdx}
                  />
                );
              default:
                return <SetPrice />;
            }
          })()}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default function Profile() {
  const { accounts } = useApi();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [nftMetadata, setNFTMetada] = useState({
    collectionId: "",
    startIdx: "",
    name: "",
    uri: "",
  });

  return (
    <Container py={12} maxW="container.lg">
      <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen />
        <Flex flexDir="column" justify="center" align="center">
          {accounts && accounts.length > 0 ? (
            <>
              <RandomAvatar address={accounts[0].address} />
              <Text color="gray.500" align="center" fontSize="xl" mt="5">
                {accounts[0].address}
              </Text>
            </>
          ) : (
            <>
              <SkeletonCircle size="10" />
              <SkeletonText
                align="center"
                mt="4"
                width="400px"
                noOfLines={1}
                spacing="4"
              />
            </>
          )}
        </Flex>
        <Tabs isLazy colorScheme="grey">
          <TabList>
            <Tab>Tokens</Tab>
            <Tab>Sub Tokens</Tab>
            <Tab>Graph Tokens</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Tokens
                accounts={accounts}
                setNFTMetada={setNFTMetada}
                openActionModal={onOpen}
              />
            </TabPanel>
            <TabPanel>
              <Tokens
                isSub
                accounts={accounts}
                setNFTMetada={setNFTMetada}
                openActionModal={onOpen}
              />
            </TabPanel>
            <TabPanel>
              <Tokens
                isGraph
                accounts={accounts}
                setNFTMetada={setNFTMetada}
                openActionModal={onOpen}
              />
              {/* <p>two!</p> */}
            </TabPanel>
          </TabPanels>
        </Tabs>
        <ActionModal
          isOpen={isOpen}
          onClose={onClose}
          collectionId={nftMetadata.collectionId}
          startIdx={nftMetadata.startIdx}
          name={nftMetadata.name}
          uri={nftMetadata.uri}
        />
      </QueryClientProvider>
    </Container>
  );
}
