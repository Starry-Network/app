import {
  LinkBox,
  Center,
  useColorModeValue,
  Heading,
  Text,
  Stack,
  Image,
} from "@chakra-ui/react";
import { Link as ReachLink } from "react-router-dom";

export default function TokenCard({
  href = "/NFTDetail",
  title = "NFT Title NFT Title NFT Title NFT Title",
  url = "https://lh3.googleusercontent.com/1_I7m72fLjas0kXfjYQ8p44gUhi5yMNYgi67t6gGu8ZCM5Z0zcwUAoRNYTlCnwgc1dDGeX4lnzgTfKfNTyJMtcI7trmA8TL32ked=s250",
  price = "0.002",
  symbol = "DOT",
  leftToken = "2",
  totalToken = "10",
  disableLink = false,
  onClick,
}) {
  return (
    <Center py={5} onClick={onClick}>
      <LinkBox
        p={6}
        maxW={"260px"}
        bg={useColorModeValue("white", "gray.800")}
        boxShadow={"md"}
        rounded={"lg"}
      >
        <Center
          as={ReachLink}
          to={href}
          pointerEvents={disableLink ? "none" : null}
        >
          <Image rounded={"lg"} boxSize="220px" objectFit="contain" src={url} />
        </Center>
        <Stack mt={5}>
          <Heading fontSize={"xl"} fontFamily={"body"} maxW="240px" isTruncated>
            {title}
          </Heading>
          <Text
            color={"gray.900"}
            fontSize={"sm"}
            textTransform={"uppercase"}
            fontWeight="bold"
            maxW="240px"
            isTruncated
          >
            {price} {symbol}
          </Text>
          <Text
            color={"gray.500"}
            fontSize={"sm"}
            fontWeight="bold"
            maxW="240px"
            isTruncated
          >
            {leftToken} of {totalToken}
          </Text>
        </Stack>
      </LinkBox>
    </Center>
  );
}
