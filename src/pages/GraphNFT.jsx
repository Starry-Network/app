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
          <FormLabel htmlFor="collection">Father collection</FormLabel>
          <Select placeholder="Select collection">
            <option value="option1">Collection 1</option>
            <option value="option2">Collection 2</option>
            <option value="option3">Collection 3</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Father NFT Start Idx</FormLabel>
          <NumberInput defaultValue={0} min={0}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="collection">Child collection</FormLabel>
          <Select placeholder="Select collection">
            <option value="option1">Collection 1</option>
            <option value="option2">Collection 2</option>
            <option value="option3">Collection 3</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Child NFT Start Idx</FormLabel>
          {/* <Input name="description" placeholder="description" /> */}
          <NumberInput defaultValue={0} min={0}>
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
          Link
        </Button>
      </Stack>
    </Container>
  );
}
