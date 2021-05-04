import {
  Avatar,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  Grid,
  Spacer,
  Stack,
  HStack,
  Center,
} from "@chakra-ui/react";

const DAOInfo = () => (
  <Box w="full" p="6" boxShadow="md" rounded="lg" minH="150px">
    {/* QAQ */}
    <Flex direction="row" align="center" w="full">
      <Avatar size="md" name="Dan Abrahmov" src="https://bit.ly/dan-abramov" />
      <Heading ml={4} fontSize="xl">
        QAQ
      </Heading>
    </Flex>
    <Text py="5" color="gray.500">
      This is a dao description, nothing
    </Text>
    <Grid templateColumns="repeat(3, 1fr)" gap={6}>
      <Box w="full">
        <Text fontWeight="bold">Members</Text>
        <Text>12</Text>
      </Box>
      <Box w="full">
        <Text fontWeight="bold">Shares</Text>
        <Text>150</Text>
      </Box>
      <Spacer />
    </Grid>
  </Box>
);

export default function DAODetail() {
  return (
    <Container py={12}>
      <DAOInfo />
      <Stack py="10">
        <Flex flexDir="row" flex="5" boxShadow="md" rounded="lg">
          <Flex
            flex="4"
            px="5"
            minH="100px"
            flexDir="column"
            justify="space-around"
          >
            <Text fontWeight="bold">A Proposal Title</Text>
            <HStack>
              <Text>2 Yes</Text>
              <Text>3 No</Text>
            </HStack>
          </Flex>
          <Flex flex="1">
            <Center w="full">
              <Button>Vote</Button>
            </Center>
          </Flex>
        </Flex>
      </Stack>
    </Container>
  );
}
