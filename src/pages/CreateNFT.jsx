import React, { useEffect, useState } from "react";
import {
  Container,
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
  Button,
  Stack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
} from "@chakra-ui/react";

import { useHistory } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { stringToHex } from "@polkadot/util";
import { urlSource } from "ipfs-http-client";

import { QueryClient, QueryClientProvider } from "react-query";

import Upload from "../components/Upload";
import ipfs from "../utils/ipfs";
import { useTransaction } from "../hooks/transaction";
import { useApi } from "../hooks/api";

import Collections from "../components/Collections";
import WaitingDialog from '../components/WaitingDialog'

const queryClient = new QueryClient();

function CreateCollection({ isOpen, onOpen, onClose }) {
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
    console.log("values", values);
    console.log("e", errors);

    const blobUrl = values.file[0].preview;
    console.log(blobUrl);
    console.log("in transaction", accounts);
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
      console.log("Qaq");
      toast({
        // title: "Info",
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
        creator: "",
        name: "",
        description: "",
        asset: "",
      };

      metadata = {
        ...metadata,
        creator: accounts[0].address,
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

      const state = queryClient.getQueryState("collections");
      console.log("state", state);

      const result = await newTransaction(
        "collectionModule",
        "createCollection",
        [metadataCIDHash, false]
      );

      if (result && result.success) {
        console.log("tx result", result);
        // const events = await getEvents(api, result.hash, "collectionModule");
        // const newData = { label: events[0].data[1], value: events[0].data[1] };
        // console.log(newData);
        // mutate({ newData });
        //
        onClose();
        openDialog();
        reset("", {
          keepValues: false,
        });
        setTimeout(() => {
          closeDialog();
        }, 1000 * 20);
      }

      console.log(metadataCID);
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
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalContent>
              <ModalHeader>Create collection</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <FormControl isInvalid={errors.name}>
                  <FormLabel htmlFor="name">Name</FormLabel>
                  <Input placeholder="Collection name" {...register("name")} />
                  <FormErrorMessage>
                    {errors.name && "Name is required"}
                  </FormErrorMessage>
                </FormControl>

                <FormControl mt={4}>
                  <FormLabel htmlFor="description">Description</FormLabel>
                  <Input
                    placeholder="Collection description"
                    {...register("description")}
                  />
                </FormControl>

                <FormControl mt={4} isInvalid={errors.file}>
                  <FormLabel htmlFor="file">Upload cover</FormLabel>
                  <Upload label="file" />
                  <FormErrorMessage>
                    {errors.file && "File is required"}
                  </FormErrorMessage>
                </FormControl>
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
                  Create
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
    </>
  );
}

export default function Create() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const closeDialog = () => setDialogIsOpen(false);
  const openDialog = () => setDialogIsOpen(true);

  const methods = useForm();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = methods;

  console.log("select collection:", watch("collection"));
  console.log("amount:", watch("amount"));
  console.log("file:", watch("file"));

  const { api, accounts, modules, ready } = useApi();
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
    console.log("values", values);
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
        description: "",
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

      const result = await newTransaction("nftModule", "mintNonFungible", [
        accounts[0].address,
        values.collection,
        metadataCIDHash,
        values.amount,
      ]);

      if (result && result.success) {
        openDialog();
        toast({
          description: "Will redirect to Profile later",
          status: "info",
          duration: 9000,
          position: "top-right",
          isClosable: true,
        });
        setTimeout(() => {
          history.push("/profile");
          closeDialog();
        }, 1000 * 20);
        // clearTimeout(timer);
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

  useEffect(() => {
    console.log("e", errors);
  }, [errors]);

  return (
    <Container py={12}>
      <WaitingDialog dialogIsOpen={dialogIsOpen} closeDialog={closeDialog} />
      <QueryClientProvider client={queryClient}>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
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
                  placeholder="name"
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
                  placeholder="description"
                  {...register("description")}
                />
              </FormControl>
              <FormControl isInvalid={errors.amount}>
                <FormLabel>Number of items</FormLabel>
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
              <FormControl isInvalid={errors.collection}>
                <FormLabel htmlFor="collection">Collection</FormLabel>
                <Collections
                  accounts={accounts}
                  {...register("collection", { required: true })}
                />
                <FormErrorMessage>
                  {errors.collection && "Collection is required"}
                </FormErrorMessage>
                <FormHelperText
                  textDecoration="underline"
                  color={"gray.900"}
                  onClick={onOpen}
                  _hover={{
                    cursor: "pointer",
                  }}
                >
                  Have no collection? Click here to create
                </FormHelperText>
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
                Mint
              </Button>
            </Stack>
          </form>
        </FormProvider>
        <CreateCollection isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
      </QueryClientProvider>
    </Container>
  );
}
