import React, { useEffect, useState, forwardRef } from "react";
import {
  Container,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  Button,
  Stack,
  Select,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Spinner,
} from "@chakra-ui/react";

import { useForm, FormProvider } from "react-hook-form";
import { stringToHex } from "@polkadot/util";
import { urlSource } from "ipfs-http-client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "react-query";

import ReactSelect from "react-select";

import { request, gql } from "graphql-request";

import Upload from "../components/Upload";
import ipfs from "../utils/ipfs";
import { useTransaction } from "../utils/transaction";
import { useApi } from "../utils/api";
import { getEvents } from "../utils/getEvents";

// const endpoint = process.env.REACT_APP_QUERY_ENDPOINT;
const endpoint = process.env.REACT_APP_QUERY_ENDPOINT;
// const endpoint = "https://graphqlzero.almansi.me/api";

const queryClient = new QueryClient();

function useCollections(accounts) {
  const address = accounts && accounts.length > 0 ? accounts[0].address : null;

  return useQuery(
    "collections",
    async () => {
      const {
        collections: { nodes },
      } = await request(
        endpoint,
        gql`
          query {
            collections(
              filter: {
                owner: {
                  equalTo: "${address}"
                }
              }
            ) {
              nodes {
                id
              }
            }
          }
      `
      );
      const data = nodes.map((collection) => {
        return { label: collection.id, value: collection.id };
      });
      console.log(nodes);
      return data;
    },
    {
      // enabled: enable,
      enabled: !!address,
    }
  );
}

function CreateCollection({ isOpen, onOpen, onClose }) {
  const qc = useQueryClient();

  const { api, accounts, modules, ready } = useApi();
  const toast = useToast();
  console.log("ready", ready);

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
    formState: { errors, isSubmitting },
  } = methods;

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const { mutate } = useMutation(
    (newData) => {
      console.log("new data:", newData);
    },
    {
      // When mutate is called:
      onMutate: async (newCollection) => {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await qc.cancelQueries("collections");

        // Snapshot the previous value
        const previousCollections = qc.getQueryData("collections");
        console.log("previousCollections", previousCollections);

        // Optimistically update to the new value
        qc.setQueryData("collections", (old) => {
          return [...old, newCollection];
        });

        console.log(qc.getQueryData("collections"));
        // Return a context object with the snapshotted value
        return { previousCollections };
      },
    }
  );

  const onSubmit = async (values) => {
    // return console.log(typeof newTransaction);

    console.log("values", values);
    console.log("e", errors);

    await sleep(3000);
    // console.log(values);
    const blobUrl = values.file[0].preview;
    console.log(blobUrl);
    console.log("in transaction", accounts);
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
      console.log("Qaq");
      toast({
        // title: "Info",
        description: "uploading image",
        status: "info",
        duration: 9000,
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
        const events = await getEvents(api, result.hash, "collectionModule");
        const newData = { label: events[0].data[1], value: events[0].data[1] };
        console.log(newData);
        mutate({ newData });
      }

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
    <>
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
                  <FormLabel htmlFor="describe">Describe</FormLabel>
                  <Input
                    placeholder="Collection describe"
                    {...register("describe")}
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
                  isLoading={isSubmitting}
                >
                  Create
                </Button>
                <Button onClick={onClose}>Cancel</Button>
              </ModalFooter>
            </ModalContent>
          </form>
        </FormProvider>
      </Modal>
    </>
  );
}

const Collections = forwardRef(({ onChange, onBlur, name, accounts }, ref) => {
  const { status, data, error } = useCollections(accounts);

  return (
    <>
      {status === "loading" || status === "idle" ? (
        <>
          <Select
            display="none"
            name={name}
            ref={ref}
            onChange={onChange}
            onBlur={onBlur}
          ></Select>
          <Spinner />
        </>
      ) : status === "error" ? (
        <Select
          placeholder={`Error: ${error.message}`}
          name={name}
          ref={ref}
          onChange={onChange}
          onBlur={onBlur}
        ></Select>
      ) : (
        <Select
          placeholder="Select collection"
          name={name}
          ref={ref}
          onChange={onChange}
          onBlur={onBlur}
        >
          {data.map((collection, index) => (
            <option key={index} value={collection.value}>
              {collection.value}
            </option>
          ))}
        </Select>
      )}
    </>
  );
});

export default function Create() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const methods = useForm();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  console.log("select collection:", watch("collection"));
  console.log("amount:", watch("amount"));
  console.log("file:", watch("file"));

  const { api, accounts, modules, ready } = useApi();
  const toast = useToast();

  // const [address, setAddress] = useState("")

  // useEffect(() => {
  //   // console.log("qaq", accounts)
  //   setAddress(accounts[0].address)
  // }, [accounts])
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
        isClosable: true,
      });
    }

    const blobUrl = values.file[0].preview;

    try {
      console.log("Qaq");
      toast({
        // title: "Info",
        description: "uploading image",
        status: "info",
        duration: 9000,
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
        isClosable: true,
      });

      const metadataInfo = await ipfs.add(JSON.stringify(metadata));
      const metadataCID = metadataInfo.cid.toString();

      const metadataCIDHash = stringToHex(metadataCID);

      console.log("metadataCIDHash", metadataCIDHash);

      console.log(metadataCID);

      await newTransaction("nftModule", "mintNonFungible", [
        accounts[0].address,
        values.collection,
        metadataCIDHash,
        values.amount,
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
    // return new Promise((resolve) => {
    //   console.log("e", errors);

    //   console.log(JSON.stringify(values, null, 2));
    //   resolve();
    // });
  };

  useEffect(() => {
    console.log("e", errors);
  }, [errors]);

  return (
    <Container py={12}>
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
