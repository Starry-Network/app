import { useState } from "react";
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

import { useForm, FormProvider } from "react-hook-form";
import { request, gql } from "graphql-request";

import { useApi } from "../hooks/api";
import { useTransaction } from "../hooks/transaction";
import Collections from "../components/Collections";
import WaitingDialog from "../components/WaitingDialog";

const endpoint = process.env.REACT_APP_QUERY_ENDPOINT;

export default function SplitNFT() {
  const { api, accounts, modules, ready } = useApi();

  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const closeDialog = () => setDialogIsOpen(false);
  const openDialog = () => setDialogIsOpen(true);

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
    <Container py={12}>
      <WaitingDialog dialogIsOpen={dialogIsOpen} closeDialog={closeDialog} />
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
    </Container>
  );
}
