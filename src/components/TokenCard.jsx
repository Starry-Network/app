import {
  LinkBox,
  Center,
  useColorModeValue,
  Heading,
  Text,
  Stack,
  Image,
  Skeleton,
  SkeletonText,
} from "@chakra-ui/react";
import { Link as ReachLink } from "react-router-dom";

export function TokenCard({
  href = "/NFTDetail",
  title = "NFT Title NFT Title NFT Title NFT Title",
  url = "https://lh3.googleusercontent.com/1_I7m72fLjas0kXfjYQ8p44gUhi5yMNYgi67t6gGu8ZCM5Z0zcwUAoRNYTlCnwgc1dDGeX4lnzgTfKfNTyJMtcI7trmA8TL32ked=s250",
  // price = "0.002",
  price = false,
  symbol = "DOT",
  amount = "2",
  disableLink = false,
  onClick = () => {},
}) {
  return (
    <Center py={5}>
      <LinkBox
        p={6}
        maxW={"260px"}
        bg={useColorModeValue("white", "gray.800")}
        boxShadow={"md"}
        rounded={"lg"}
        onClick={onClick}
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
            {price ? (
              <>
                {price} {symbol}
              </>
            ) : null}
          </Text>
          <Text
            color={"gray.500"}
            fontSize={"sm"}
            fontWeight="bold"
            maxW="240px"
            isTruncated
          >
            {amount} copies
          </Text>
        </Stack>
      </LinkBox>
    </Center>
  );
}

export function SkeletonCard() {
  return (
    <Center py={5}>
      <LinkBox
        p={6}
        maxW={"260px"}
        bg={useColorModeValue("white", "gray.800")}
        boxShadow={"md"}
        rounded={"lg"}
      >
        <Center>
          {/* <Image rounded={"lg"} boxSize="220px" objectFit="contain" src={url} /> */}
          <Skeleton height="280px" width="280px" />
        </Center>
        <Stack mt={5}>
          <SkeletonText mt="4" noOfLines={3} spacing="4" />
        </Stack>
      </LinkBox>
    </Center>
  );
}
