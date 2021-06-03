import { useState } from "react";
import {
  Container,
  FormControl,
  FormLabel,
  Stack,
  Button,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormErrorMessage,
  FormHelperText,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useToast,
} from "@chakra-ui/react";

import { useHistory } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { request, gql } from "graphql-request";

import { useForm, FormProvider } from "react-hook-form";
import { stringToHex } from "@polkadot/util";
import { urlSource } from "ipfs-http-client";

import { useApi } from "../hooks/api";
import { useTransaction } from "../hooks/transaction";
import ipfs from "../utils/ipfs";

import Collections from "../components/Collections";
import Upload from "../components/Upload";
import WaitingDialog from "../components/WaitingDialog";

const endpoint = process.env.REACT_APP_QUERY_ENDPOINT;
const queryClient = new QueryClient();

function CreateSubCollection({ isOpen, onOpen, onClose }) {
  const { api, accounts, modules, ready } = useApi();
  const toast = useToast();
  console.log("ready", ready);

  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const closeDialog = () => setDialogIsOpen(false);
  const openDialog = () => setDialogIsOpen(true);

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
    formState: { errors },
    reset,
  } = methods;

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

    // const palletId = "5EYCAe5cvWwuASaBGzVg1qYZsaxUYejHQf9rqLHKCEeTfbA8";
    const nftId = `${values.collection}-${values.startIdx}`;
    const { nft } = await request(
      endpoint,
      gql`
          query {
            nft(
              id: "${nftId}"
            ) {
              owner
            }
          }
        `
    );
    if (!nft) {
      return toast({
        title: "Error",
        description: "can't get nft",
        status: "error",
        duration: 9000,
        position: "top-right",
        isClosable: true,
      });
    }
    if (nft.owner !== accounts[0].address) {
      return toast({
        title: "Error",
        description: "have no permission",
        status: "error",
        duration: 9000,
        position: "top-right",
        isClosable: true,
      });
    }

    try {
      const result = await newTransaction("subNftModule", "create", [
        values.collection,
        values.startIdx,
        false,
      ]);
      if (result && result.success) {
        openDialog();
        setTimeout(() => {
          closeDialog();
          reset("", {
            keepValues: false,
          });
          onClose();
          toast({
            description: "You can split it now",
            status: "success",
            duration: 9000,
            position: "top-right",
            isClosable: true,
          });
        }, 1000 * 20);
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
      <WaitingDialog dialogIsOpen={dialogIsOpen} closeDialog={closeDialog} />
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        {/* <QueryClientProvider client={queryClient}> */}
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalContent>
              <ModalHeader>Create collection</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <Stack spacing={4}>
                  <FormControl isInvalid={errors.collection}>
                    <FormLabel htmlFor="collection">Collection</FormLabel>
                    <Collections
                      accounts={accounts}
                      {...register("collection", { required: true })}
                    />
                    <FormErrorMessage>
                      {errors.collection && "Collection is required"}
                    </FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={errors.startIdx}>
                    <FormLabel>NFT Start Idx</FormLabel>
                    {/* <Input name="description" placeholder="description" /> */}
                    <NumberInput defaultValue={0} min={0}>
                      <NumberInputField
                        {...register("startIdx", { required: true, min: 0 })}
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormErrorMessage>
                      {errors.startIdx && "startIdx is required"}
                    </FormErrorMessage>
                  </FormControl>

                  <Button
                    size="md"
                    bg="gray.900"
                    color="white"
                    _hover={{
                      bg: "purple.550",
                    }}
                    type="submit"
                  >
                    Split
                  </Button>
                </Stack>
              </ModalBody>
            </ModalContent>
          </form>
        </FormProvider>
      </Modal>
    </>
  );
}

export default function SplitNFT() {
  const { api, accounts, modules, ready } = useApi();

  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const closeDialog = () => setDialogIsOpen(false);
  const openDialog = () => setDialogIsOpen(true);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const methods = useForm();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  const toast = useToast();
  const history = useHistory();

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

    const blobUrl = values.file[0].preview;

    try {
      console.log("Qaq");
      toast({
        description: "uploading image",
        status: "info",
        duration: 9000,
        position: "top-right",
        isClosable: true,
      });
      const fileInfo = await ipfs.add(urlSource(blobUrl));
      const fileCID = fileInfo.cid.toString();

      console.log("ipfs:", fileInfo);

      let metadata = {
        minter: "",
        name: "",
        describe: "",
        asset: "",
      };

      metadata = {
        ...metadata,
        minter: accounts[0].address,
        name: values.name,
        description: values.description,
        asset: fileCID,
      };

      toast({
        // title: "Info",
        description: "uploading metadata",
        status: "info",
        duration: 9000,
        position: "top-right",
        isClosable: true,
      });

      const metadataInfo = await ipfs.add(JSON.stringify(metadata));
      const metadataCID = metadataInfo.cid.toString();

      const metadataCIDHash = stringToHex(metadataCID);

      console.log("metadataCIDHash", metadataCIDHash);

      console.log(metadataCID);

      const result = await newTransaction("subNftModule", "mintNonFungible", [
        accounts[0].address,
        values.subCollection,
        metadataCIDHash,
        values.amount,
      ]);

      if (result && result.success) {
        openDialog();
        setTimeout(() => {
          closeDialog();
          toast({
            description:
              "Congratulations! You can find them in your Profile page",
            status: "success",
            duration: 9000,
            position: "top-right",
            isClosable: true,
          });
          history.push("/profile");
        }, 1000 * 20);
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
    <Container py={12}>
      <WaitingDialog dialogIsOpen={dialogIsOpen} closeDialog={closeDialog} />

      <QueryClientProvider client={queryClient}>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              <FormControl isInvalid={errors.subCollection}>
                <FormLabel htmlFor="collection">Sub Collection</FormLabel>
                <Collections
                  accounts={accounts}
                  {...register("subCollection", { required: true })}
                  isSub={true}
                />
                <FormErrorMessage>
                  {errors.subCollection && "Sub Collection is required"}
                </FormErrorMessage>
                <FormHelperText
                  textDecoration="underline"
                  color={"gray.900"}
                  onClick={onOpen}
                  _hover={{
                    cursor: "pointer",
                  }}
                >
                  Have no Sub Collection? Click here to create one
                </FormHelperText>
              </FormControl>

              <FormControl isInvalid={errors.amount}>
                <FormLabel>Number of sub-tokens</FormLabel>
                <NumberInput defaultValue={1} min={1}>
                  <NumberInputField
                    {...register("amount", { required: true, min: 1 })}
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

              <FormControl isInvalid={errors.file}>
                <FormLabel htmlFor="file">Upload cover</FormLabel>
                <Upload label="file" />
                <FormErrorMessage>
                  {errors.file && "File is required"}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={errors.name}>
                <FormLabel htmlFor="name">Name</FormLabel>
                <Input
                  name="name"
                  placeholder="Such as: #2 of sub nft"
                  {...register("name", { required: true })}
                />
                <FormErrorMessage>
                  {errors.name && "Name is required"}
                </FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="description">Description</FormLabel>
                <Input
                  name="description"
                  placeholder="Part of xxx"
                  {...register("description")}
                />
              </FormControl>
              <Button
                size="md"
                bg="gray.900"
                color="white"
                _hover={{
                  bg: "purple.550",
                }}
                type="submit"
              >
                Split
              </Button>
            </Stack>
          </form>
        </FormProvider>
        <CreateSubCollection
          isOpen={isOpen}
          onOpen={onOpen}
          onClose={onClose}
        />
      </QueryClientProvider>
    </Container>
  );
}
