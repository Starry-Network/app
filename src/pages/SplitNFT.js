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
  useToast,
} from "@chakra-ui/react";

import { QueryClient, QueryClientProvider } from "react-query";

import { useForm, FormProvider } from "react-hook-form";
import { request, gql } from "graphql-request";
import { stringToHex } from "@polkadot/util";
import { urlSource } from "ipfs-http-client";

import { useApi } from "../hooks/api";
import { useTransaction } from "../hooks/transaction";
import ipfs from "../utils/ipfs";

import Collections from "../components/Collections";
import Upload from "../components/Upload";

const endpoint = process.env.REACT_APP_QUERY_ENDPOINT;
const queryClient = new QueryClient();

export default function SplitNFT() {
  const { api, accounts, modules, ready } = useApi();
  const methods = useForm();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
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

      await newTransaction("subModule", "mintNonFungible", [
        accounts[0].address,
        values.subCollection,
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

  };

  return (
    <Container py={12}>
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
      </QueryClientProvider>
    </Container>
  );
}
