import {
  Button,
  Container,
  FormControl,
  FormLabel,
  Stack,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormErrorMessage,
  useToast,
} from "@chakra-ui/react";
import { useForm, FormProvider } from "react-hook-form";

import { stringToHex } from "@polkadot/util";
import { urlSource } from "ipfs-http-client";

import ipfs from "../utils/ipfs";
import { useTransaction } from "../hooks/transaction";
import { useApi } from "../hooks/api";

import Upload from "../components/Upload";

export default function SummonDAO() {
  const methods = useForm();
  const {
    register,
    handleSubmit,
    formState: { errors },
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

  const onSubmit = async (values) => {
    console.log(values);
    const blobUrl = values.file[0].preview;
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
        name: "",
        description: "",
        asset: "",
      };

      metadata = {
        ...metadata,
        name: values.name,
        description: values.description,
        asset: fileCID,
      };

      toast({
        description: "uploading metadata",
        status: "info",
        duration: 9000,
        position: "top-right",
        isClosable: true,
      });

      const metadataInfo = await ipfs.add(JSON.stringify(metadata));
      const metadataCID = metadataInfo.cid.toString();

      const metadataCIDHash = stringToHex(metadataCID);

      await newTransaction("nftdaoModule", "createDao", [
        metadataCIDHash,
        values.periodDuration,
        values.votingPeriod,
        values.gracePeriod,
        values.sharesRequest,
        values.proposalDeposit,
        values.processingReward,
        values.dilutionBound,
      ]);

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
    <Container py={12}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={4}>
            <FormControl isInvalid={errors.file}>
              <FormLabel htmlFor="upload">Upload Logo</FormLabel>
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
            <FormControl isInvalid={errors.description}>
              <FormLabel htmlFor="description">Description</FormLabel>
              <Input
                name="description"
                placeholder="description"
                {...register("description", { required: true })}
              />
              <FormErrorMessage>
                {errors.description && "Description is required"}
              </FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={errors.description}>
              <FormLabel>Period duration</FormLabel>
              <NumberInput defaultValue={100} min={1}>
                <NumberInputField
                  {...register("periodDuration", { required: true })}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>
                {errors.periodDuration && "Period duration"}
              </FormErrorMessage>
            </FormControl>
            <FormControl>
              <FormLabel>Voting period</FormLabel>
              <NumberInput defaultValue={100} min={1}>
                <NumberInputField
                  {...register("votingPeriod", { required: true })}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Grace period</FormLabel>
              <NumberInput defaultValue={100} min={1}>
                <NumberInputField
                  {...register("gracePeriod", { required: true })}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Shares request</FormLabel>
              <NumberInput defaultValue={100} min={1}>
                <NumberInputField
                  {...register("sharesRequest", { required: true })}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Proposal deposit</FormLabel>
              <NumberInput defaultValue={100} min={1}>
                <NumberInputField
                  {...register("proposalDeposit", { required: true })}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Processing reward</FormLabel>
              <NumberInput defaultValue={100} min={1}>
                <NumberInputField
                  {...register("processingReward", { required: true })}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Dilution bound</FormLabel>
              <NumberInput defaultValue={3} min={1}>
                <NumberInputField
                  {...register("dilutionBound", { required: true })}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <Button
              type="submit"
              size="md"
              bg="gray.900"
              color="white"
              _hover={{
                bg: "purple.550",
              }}
            >
              Summon
            </Button>
          </Stack>
        </form>
      </FormProvider>
    </Container>
  );
}
