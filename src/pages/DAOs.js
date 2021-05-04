import {
  Center,
  LinkBox,
  Heading,
  Text,
  Avatar,
  Flex,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link as ReachLink } from "react-router-dom";

function DAO({ href = "/DAODetail" }) {
  return (
    <Center py={5}>
      <LinkBox
        as={ReachLink}
        to={href}
        role={"group"}
        p={6}
        maxW={"260px"}
        w={"full"}
        bg={useColorModeValue("white", "gray.800")}
        boxShadow={"md"}
        rounded={"lg"}
      >
        <Flex direction="row" align="center" w="full">
          <Avatar
            size="md"
            name="Dan Abrahmov"
            src="https://bit.ly/dan-abramov"
          />
          <Heading ml={4} fontSize="xl">
            QAQ
          </Heading>
        </Flex>
        <Text py={5} color={"gray.500"}>
          A DAO to give people shares based on how{" "}
        </Text>
        <Text>12 Members</Text>
      </LinkBox>
    </Center>
  );
}

export default function DAOs() {
  return (
      <SimpleGrid minChildWidth="280px" py={12}>
        <DAO />
        <DAO />
        <DAO />
        <DAO />
      </SimpleGrid>
  );
}
