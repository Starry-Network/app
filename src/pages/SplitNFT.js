import {
  Container,
  FormControl,
  FormLabel,
  Stack,
  Button,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";

export default function SplitNFT() {
  return (
    <Container py={12}>
      <Stack spacing={4}>
        <FormControl>
          <FormLabel htmlFor="collection">Collection</FormLabel>
          <Select placeholder="Select collection">
            <option value="option1">Collection 1</option>
            <option value="option2">Collection 2</option>
            <option value="option3">Collection 3</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>NFT Start Idx</FormLabel>
          {/* <Input name="description" placeholder="description" /> */}
          <NumberInput defaultValue={0} min={0}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl>
          <FormLabel>Number of sub-tokens</FormLabel>
          {/* <Input name="description" placeholder="description" /> */}
          <NumberInput defaultValue={1} min={1}>
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
          Mint
        </Button>
      </Stack>
    </Container>
  );
}
