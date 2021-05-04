import {
  Center,
  Heading,
  Text,
  Stack,
  Image,
  Box,
  Container,
  GridItem,
  Grid,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  HStack,
  Button,
} from "@chakra-ui/react";

export default function NFTDetail() {
  return (
    <Container maxW={"9xl"} py={12}>
      <Grid
        templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(6, 1fr)" }}
        gap={10}
      >
        <GridItem colSpan={{ base: 1, md: 4 }}>
          <Center height={"75vh"}>
            <Image
              rounded={"lg"}
              boxSize="450px"
              // boxSize="450px"
              // objectFit="cover"
              objectFit="contain"
              // src="../image.jpeg"
              // src="https://ipfs.rarible.com/ipfs/Qmdg69GmzvD1VVDfuSMPntGoVeVcSqddPqNb8eLZtht1zC/image.jpeg"
                // src="https://ipfs.rarible.com/ipfs/QmP4rvmwRcx7mUKAKhtLgfjNi11F5kEQAXxB3CFZp6Kz3c/image.jpeg"
              src="https://d7hftxdivxxvm.cloudfront.net?resize_to=fit&src=http%3A%2F%2Ffiles.artsy.net%2Fimages%2Fthumbnails%2Fpost-war.png&width=357&height=175&quality=80"

            />
          </Center>
        </GridItem>
        <GridItem colSpan={{ base: 1, md: 2 }}>
          <Box>
            <Stack>
              <HStack spacing="24px">
                <Heading as="h2" size="xl">
                  NFT Title
                </Heading>
                <Heading as="h2" size="xl" color={"gray.500"}>
                  #2
                </Heading>
              </HStack>

              <Stack direction={["column", "row"]} spacing="24px">
                <Text fontSize="lg" fontWeight="bold">
                  1.2 Uint
                </Text>
                <Text fontSize="lg" fontWeight="bold" color={"gray.500"}>
                  19 / 20
                </Text>
              </Stack>
              <Box py={5}>
                <Text color={"gray.500"}>This is a NFT Minted in Starry</Text>
              </Box>
              <Accordion allowMultiple>
                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        Creator
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    5CMDe6aVXnQeAuyq2CP7Ky34wA5zucCQzgSWvESjSGAGLVAy
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        Owner
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    5CMDe6aVXnQeAuyq2CP7Ky34wA5zucCQzgSWvESjSGAGLVAy
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        Collection
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    0x094969f6c3bec4bcd681dfeafaec74041f4efa969e011dd7e92fa13b18ad97e6
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
              <Box>
                <Button
                  w={"full"}
                  size="lg"
                  borderRadius={"none"}
                  bg={"gray.900"}
                  color={"white"}
                  mt={5}
                  _hover={{
                    bg: "purple.550",
                    borderColor: "gray.900",
                  }}
                >
                  BUY
                </Button>
              </Box>
            </Stack>
          </Box>
        </GridItem>
      </Grid>
    </Container>
  );
}
