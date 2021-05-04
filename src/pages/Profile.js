import {
  Flex,
  Container,
  Avatar,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
} from "@chakra-ui/react";

import TokenCard from "../components/TokenCard";

export default function Profile() {
  return (
    <Container py={12} maxW="container.lg">
      <Flex flexDir="column" justify="center" align="center">
        <Avatar
          size="xl"
          name="Dan Abrahmov"
          src="https://bit.ly/dan-abramov"
        />
        <Heading align="center" fontSize="xl" mt="5">
          Dan Abrahmov
        </Heading>
      </Flex>
      <Tabs isLazy colorScheme="grey">
        <TabList>
          <Tab>Tokens</Tab>
          <Tab>Collectoins</Tab>
        </TabList>
        <TabPanels>
          {/* initially mounted */}
          <TabPanel>
            {/* <p>one!</p> */}
            <SimpleGrid minChildWidth="280px">
              <TokenCard
              disableLink={true}
                onClick={(e) => {
                    e.persist(); 
                    e.nativeEvent.stopImmediatePropagation();
                    e.stopPropagation();
                  alert("qaq");
                  console.log("qaq")
                  e.preventDefault();
                  e.stopPropagation()
                  return false;
                }}
              />
              <TokenCard url="https://ipfs.rarible.com/ipfs/QmP4rvmwRcx7mUKAKhtLgfjNi11F5kEQAXxB3CFZp6Kz3c/image.jpeg" />
              <TokenCard url="https://lh3.googleusercontent.com/NNf1COFJ0u8WNyteepk192LxFe-HwFThj5j4dP4whcyUixB2ItuD1cTt5NBOnGjHTZc0JmmjVI47sH79elDI-kex=s250" />
              <TokenCard url="https://lh3.googleusercontent.com/NNf1COFJ0u8WNyteepk192LxFe-HwFThj5j4dP4whcyUixB2ItuD1cTt5NBOnGjHTZc0JmmjVI47sH79elDI-kex=s250" />
              <TokenCard url="https://lh3.googleusercontent.com/NNf1COFJ0u8WNyteepk192LxFe-HwFThj5j4dP4whcyUixB2ItuD1cTt5NBOnGjHTZc0JmmjVI47sH79elDI-kex=s250" />
              <TokenCard url="https://images.unsplash.com/photo-1518051870910-a46e30d9db16?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1350&q=80" />
              <TokenCard url="https://lh3.googleusercontent.com/NNf1COFJ0u8WNyteepk192LxFe-HwFThj5j4dP4whcyUixB2ItuD1cTt5NBOnGjHTZc0JmmjVI47sH79elDI-kex=s250" />
              <TokenCard url="https://d7hftxdivxxvm.cloudfront.net?resize_to=fit&src=http%3A%2F%2Ffiles.artsy.net%2Fimages%2Fthumbnails%2Fpost-war.png&width=357&height=175&quality=80" />{" "}
            </SimpleGrid>
          </TabPanel>
          {/* initially not mounted */}
          <TabPanel>
            <p>two!</p>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
}
