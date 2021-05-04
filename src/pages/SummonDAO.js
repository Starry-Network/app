import React, { useState } from "react";
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
} from "@chakra-ui/react";
import Upload from "../components/Upload";

export default function SummonDAO() {
  const [childFiles, setChildFiles] = useState([]);
  return (
    <Container py={12}>
      <Stack spacing={4}>
        <FormControl>
          <FormLabel htmlFor="upload">Upload Logo</FormLabel>
          <Upload
            name="upload"
            setChildFiles={setChildFiles}
            childFiles={childFiles}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="name">Name</FormLabel>
          <Input name="name" placeholder="name" />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="description">Description</FormLabel>
          <Input name="description" placeholder="description" />
        </FormControl>
        <FormControl>
          <FormLabel>Period duration</FormLabel>
          <NumberInput defaultValue={100} min={1}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        <FormControl>
          <FormLabel>Period duration</FormLabel>
          <NumberInput defaultValue={100} min={1}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        <FormControl>
          <FormLabel>Period duration</FormLabel>
          <NumberInput defaultValue={100} min={1}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        <FormControl>
          <FormLabel>Voting period</FormLabel>
          <NumberInput defaultValue={100} min={1}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        <FormControl>
          <FormLabel>Grace period</FormLabel>
          <NumberInput defaultValue={100} min={1}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        <FormControl>
          <FormLabel>Shares request</FormLabel>
          <NumberInput defaultValue={100} min={1}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        <FormControl>
          <FormLabel>Proposal deposit</FormLabel>
          <NumberInput defaultValue={100} min={1}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        <FormControl>
          <FormLabel>Processing reward</FormLabel>
          <NumberInput defaultValue={100} min={1}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        <FormControl>
          <FormLabel>Dilution bound</FormLabel>
          <NumberInput defaultValue={3} min={1}>
            <NumberInputField />
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
        >
          Summon
        </Button>
      </Stack>
    </Container>
  );
}
