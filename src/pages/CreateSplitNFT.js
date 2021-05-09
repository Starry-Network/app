import {
  Container,
  FormControl,
  FormLabel,
  Stack,
  Button,
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

import { useApi } from "../hooks/api";
import { useTransaction } from "../hooks/transaction";
import Collections from "../components/Collections";

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
    if (!(accounts && accounts.length > 0)) {
      return toast({
        title: "Error",
        description: "There is no account in wallet",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }

    const palletId = "5EYCAe5cvWwuASaBGzVg1qYZsaxUYejHQf9rqLHKCEeTfbA8";
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
        isClosable: true,
      });
    }
    if (nft.owner !== accounts[0].address) {
      return toast({
        title: "Error",
        description: "have no permission",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }

    try {
      await newTransaction("subModule", "create", [
        values.collection,
        values.startIdx,
        false,
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
          </form>
        </FormProvider>
      </QueryClientProvider>
    </Container>
  );
}
