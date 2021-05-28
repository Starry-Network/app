import {
  Center,
  Heading,
  Text,
  Stack,
  Image,
  Box,
  Container,
  GridItem,
  Grid,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  HStack,
  Button,
  Skeleton,
  SkeletonText,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormErrorMessage,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";

import { useParams } from "react-router-dom";

import { useQuery, QueryClient, QueryClientProvider } from "react-query";
import { request, gql } from "graphql-request";
import { useForm, FormProvider } from "react-hook-form";

import { useApi } from "../hooks/api";
import { useTransaction } from "../hooks/transaction";

const endpoint = process.env.REACT_APP_QUERY_ENDPOINT;
const queryClient = new QueryClient();

function useOrder(orderId) {
  return useQuery(
    ["order", orderId],
    async () => {
      const { order } = await request(
        endpoint,
        gql`
          query {
            order(id: "${orderId}") {
              id
                amount
                seller
                nftId
                price
            }
          }
        `
      );
      console.log("order", order);
      return order;
    },
    {
      enabled: !!orderId,
    }
  );
}
function useNFTMetadata(nftId) {
  return useQuery(
    "nft",
    async () => {
      const { nft } = await request(
        endpoint,
        gql`
          query {
            nft(id: "${nftId}") {
              id
              owner
              endIdx
              uri
            }
          }
        `
      );
      const response = await fetch(`https://gateway.ipfs.io/ipfs/${nft.uri}`);
      const metadata = await response.json();
      return {
        nft,
        metadata,
      };
    },
    {
      enabled: !!nftId,
    }
  );
}

const BuyModal = ({ name, isOpen, onClose, orderId }) => {
  const methods = useForm();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const { api, accounts, modules, ready } = useApi();

  const toast = useToast();

  const newTransaction = useTransaction({
    api,
    accounts,
    ready,
    modules,
    toast,
  });

  const buy = async (orderId, amount) => {
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
      await newTransaction("exchangeModule", "buyNft", [orderId, amount]);
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

  const onSubmit = async (values) => {
    console.log(values);
    await buy(orderId, values.amount);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalContent>
            <ModalHeader>Buy {`${name}`}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {/* <Lorem count={2} /> */}
              {/* form */}
              <FormControl isInvalid={errors.amount}>
                <FormLabel>Buy amount</FormLabel>
                <NumberInput defaultValue={1} min={1}>
                  <NumberInputField
                    {...register("amount", { required: true })}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>
                  {errors.amount && "amount is required"}
                </FormErrorMessage>
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <ModalFooter>
                <Button
                  mr={3}
                  bg="gray.900"
                  color="white"
                  _hover={{
                    bg: "purple.550",
                  }}
                  type="submit"
                  isLoading={isSubmitting}
                >
                  Buy Now!
                </Button>
                <Button onClick={onClose}>Cancel</Button>
              </ModalFooter>
            </ModalFooter>
          </ModalContent>
        </form>
      </FormProvider>
    </Modal>
  );
};

const Detail = ({ nftId, orderId = "null" }) => {
  const {
    status: NFTMetadataStatus,
    data: NFTMetadataData,
  } = useNFTMetadata(nftId);
  const {
    status: orderStatus,
    data: orderData,
  } = useOrder(orderId === "null" ? undefined : orderId);

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Container maxW={"9xl"} py={12}>
      <Grid
        templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(6, 1fr)" }}
        gap={10}
      >
        <GridItem colSpan={{ base: 1, md: 4 }}>
          <Center height={"75vh"}>
            {NFTMetadataStatus !== "success" ? (
              <Skeleton height="450px" width="450px" />
            ) : (
              <Image
                rounded={"lg"}
                boxSize="450px"
                objectFit="contain"
                // src="https://d7hftxdivxxvm.cloudfront.net?resize_to=fit&src=http%3A%2F%2Ffiles.artsy.net%2Fimages%2Fthumbnails%2Fpost-war.png&width=357&height=175&quality=80"
                src={`https://gateway.ipfs.io/ipfs/${NFTMetadataData.metadata.asset}`}
              />
            )}
          </Center>
        </GridItem>
        <GridItem colSpan={{ base: 1, md: 2 }}>
          {NFTMetadataStatus !== "success" ? (
            <Box>
              <Stack>
                <SkeletonText mt="4" noOfLines={6} spacing="10" />
              </Stack>
            </Box>
          ) : (
            <Box>
              <Stack>
                <HStack spacing="24px">
                  <Heading as="h2" size="xl">
                    {/* NFT Title */}
                    {NFTMetadataData.metadata.name}
                  </Heading>
                  <Heading as="h2" size="xl" color={"gray.500"}>
                    #{nftId.split("-")[1]}
                  </Heading>
                </HStack>

                <Stack direction={["column", "row"]} spacing="24px">
                  {orderStatus === "success" ? (
                    <Text fontSize="lg" fontWeight="bold">
                      {orderData.price} Uint
                    </Text>
                  ) : null}
                  <Text fontSize="lg" fontWeight="bold" color={"gray.500"}>
                    {/* 19 / 20 */}
                    {orderId === "null" ? (
                      Number(NFTMetadataData.nft.endIdx) -
                      Number(nftId.split("-")[1]) +
                      1
                    ) : orderStatus !== "success" ? (
                      <Spinner />
                    ) : (
                      orderData.amount
                    )}
                    copies
                  </Text>
                </Stack>
                <Box py={5}>
                  {/* <Text color={"gray.500"}>This is a NFT Minted in Starry</Text> */}
                  <Text color={"gray.500"}>
                    {NFTMetadataData.metadata.description
                      ? NFTMetadataData.metadata.description
                      : null}
                  </Text>
                </Box>
                <Accordion allowMultiple>
                  <AccordionItem>
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          Creator
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      {/* 5CMDe6aVXnQeAuyq2CP7Ky34wA5zucCQzgSWvESjSGAGLVAy */}
                      {NFTMetadataData.metadata.minter}
                    </AccordionPanel>
                  </AccordionItem>

                  <AccordionItem>
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          Owner
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      {/* 5CMDe6aVXnQeAuyq2CP7Ky34wA5zucCQzgSWvESjSGAGLVAy */}
                      {NFTMetadataData.nft.owner}
                    </AccordionPanel>
                  </AccordionItem>

                  <AccordionItem>
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          Collection
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      {/* 0x094969f6c3bec4bcd681dfeafaec74041f4efa969e011dd7e92fa13b18ad97e6 */}
                      {nftId.split("-")[0]}
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
                <Box>
                  {orderId === "null" ? null : (
                    <Button
                      isLoading={!(orderStatus === "success")}
                      disabled={!(orderStatus === "success")}
                      w={"full"}
                      size="lg"
                      borderRadius={"none"}
                      bg={"gray.900"}
                      color={"white"}
                      mt={5}
                      _hover={{
                        bg: "purple.550",
                        borderColor: "gray.900",
                      }}
                      onClick={onOpen}
                      // onClick={async () => {await buy(orderId, )} }
                    >
                      BUY
                    </Button>
                  )}
                  <BuyModal
                    isOpen={isOpen}
                    onClose={onClose}
                    orderId={orderId}
                    name={NFTMetadataData.metadata.name}
                  />
                </Box>
              </Stack>
            </Box>
          )}
        </GridItem>
      </Grid>
    </Container>
  );
};

export default function NFTDetail() {
  let { nftId, orderId } = useParams();
  return (
    <QueryClientProvider client={queryClient}>
      <Detail nftId={nftId} orderId={orderId} />
    </QueryClientProvider>
  );
}
