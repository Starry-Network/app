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

import { useApi } from "../hooks/api";
import { useTransaction } from "../hooks/transaction";

const queryClient = new QueryClient();

export default function GraphNFT() {
  const { api, accounts, modules, ready } = useApi();

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
      await newTransaction("graphModule", "linkNonFungible", [
        values.childCollection,
        values.childStartIdx,
        values.fatherCollection,
        values.fatherStartIdx,
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
              <FormControl isInvalid={errors.fatherCollection}>
                <FormLabel htmlFor="fatherCollection">Father collection</FormLabel>
                <Input
                  placeholder="Father collection id"
                  {...register("fatherCollection", { required: true })}
                />
                <FormErrorMessage>
                  {errors.fatherCollection && "Father collection is required"}
                </FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Father NFT Start Idx</FormLabel>
                <NumberInput defaultValue={0} min={0}>
                  <NumberInputField
                    {...register("fatherStartIdx", { required: true })}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl isInvalid={errors.childCollection}>
                <FormLabel htmlFor="childCollection">
                  Child collection
                </FormLabel>
                <Input
                  placeholder="Child collection id"
                  {...register("childCollection", { required: true })}
                />
                <FormErrorMessage>
                  {errors.childCollection && "Child collection is required"}
                </FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Child NFT Start Idx</FormLabel>
                <NumberInput defaultValue={0} min={0}>
                  <NumberInputField
                    {...register("childStartIdx", { required: true })}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
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
                Link
              </Button>
            </Stack>
          </form>
        </FormProvider>
      </QueryClientProvider>
    </Container>
  );
}
