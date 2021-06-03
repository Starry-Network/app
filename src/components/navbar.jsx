import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Link,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { web3Enable, web3Accounts } from "@polkadot/extension-dapp";
import Identicon from "@polkadot/react-identicon";
import { Link as ReachLink } from "react-router-dom";
import { useApi } from "../hooks/api";

const NAV_ITEMS = [
  {
    label: "Create",
    href: "/createNFT",
  },
  {
    label: "Graph NFT",
    href: "/graphNFT",
  },
  {
    label: "Split NFT",
    href: "/splitNFT",
    // children: [
    //   {
    //     label: "Create",
    //     href: "/createSplitNFT",
    //   },
    //   {
    //     label: "Split",
    //     href: "/splitNFT",
    //   },
    // ],
  },
  {
    label: "DAO",
    href: "/",
    children: [
      {
        label: "Explore",
        href: "/DAOs",
      },
      {
        label: "Summon DAO",
        href: "/summonDAO",
      },
    ],
  },
];

const DesktopSubNav = ({ label, href, subLabel }) => {
  return (
    <Link
      p={2}
      as={ReachLink}
      to={href ?? "#"}
      fontSize={"sm"}
      fontWeight={500}
      color={"gray.900"}
      _hover={{
        textDecoration: "none",
        color: "purple.550",
      }}
    >
      {label}
    </Link>
  );
};

const DesktopNav = () => {
  return (
    <Stack direction={"row"} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={"hover"} offset={[0, 20]}>
            <PopoverTrigger>
              <Link
                as={ReachLink}
                p={2}
                to={navItem.href ?? "#"}
                onClick={(e) => {
                  if (navItem.children) {
                    e.preventDefault();
                  }
                }}
                fontSize={"sm"}
                fontWeight={500}
                color={"gray.900"}
                _hover={{
                  textDecoration: "none",
                  color: "purple.550",
                }}
              >
                {navItem.label}
              </Link>
            </PopoverTrigger>
            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={"xl"}
                p={4}
                rounded={"xl"}
                minW={"sm"}
              >
                {/* <PopoverArrow /> */}
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

const MobileNav = () => {
  return (
    <Stack
      bg={useColorModeValue("white", "gray.800")}
      p={4}
      zIndex={999}
      top="60px"
      pos="fixed"
      w={"full"}
      display={{ md: "none" }}
      css={{
        backdropFilter: "saturate(180%) blur(5px)",
        backgroundColor: useColorModeValue(
          "rgba(255, 255, 255, 0.8)",
          "rgba(26, 32, 44, 0.8)"
        ),
      }}
    >
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href }) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={ReachLink}
        to={href ?? "#"}
        onClick={(e) => {
          if (children) {
            e.preventDefault();
          }
        }}
        justify={"space-between"}
        align={"center"}
        _hover={{
          textDecoration: "none",
        }}
      >
        <Text
          fontWeight={600}
          color={useColorModeValue("gray.600", "gray.200")}
        >
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={"all .25s ease-in-out"}
            transform={isOpen ? "rotate(180deg)" : ""}
            w={6}
            h={6}
          />
        )}
      </Flex>
      <Collapse in={isOpen} animateOpacity style={{ marginTop: "0!important" }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={"solid"}
          borderColor={useColorModeValue("gray.200", "gray.700")}
          align={"start"}
        >
          {children &&
            children.map((child) => (
              <Link key={child.label} py={2} href={child.href}>
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

const RandomAvatar = ({ address }) => {
  const size = 32;
  const theme = "substrate";

  return <Identicon value={address} size={size} theme={theme} />;
};

function NavBar() {
  const { isOpen, onToggle } = useDisclosure();
  const { accounts, setAccounts } = useApi();
  const toast = useToast();

  const connectWallet = async () => {
    try {
      const extensions = web3Enable("polkadot-js/apps");
      const accounts = await web3Accounts();

      if (!extensions.length && !accounts.length) {
        setAccounts(null);
      } else {
        setAccounts(accounts);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.toString(),
        status: "error",
        duration: 9000,
        position: "top-right",
        isClosable: true,
      });
    }
  };

  const getAccountName = (account) => {
    if (account.meta && account.meta.name) {
      return account.meta.name;
    } else {
      return account.address.slice(0, 8);
    }
  };

  return (
    <Box>
      <Flex
        as="header"
        pos="fixed"
        top="0"
        w="full"
        minH="60px"
        boxShadow="sm"
        zIndex="999"
        justify="center"
        css={{
          backdropFilter: "saturate(180%) blur(5px)",
          backgroundColor: useColorModeValue(
            "rgba(255, 255, 255, 0.8)",
            "rgba(26, 32, 44, 0.8)"
          ),
        }}
        color={useColorModeValue("gray.600", "white")}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle="solid"
        borderColor={useColorModeValue("gray.200", "gray.900")}
        align="center"
      >
        <Flex
          flex={{ base: 1, md: "auto" }}
          ml={{ base: -2 }}
          display={{ base: "flex", md: "none" }}
        >
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={"ghost"}
            aria-label={"Toggle Navigation"}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: "center", md: "start" }}>
          <Text
            as={ReachLink}
            to={"/"}
            textAlign={useBreakpointValue({ base: "center", md: "left" })}
            fontFamily={"heading"}
            color={useColorModeValue("gray.800", "white")}
          >
            Starry
          </Text>
        </Flex>

        <Flex
          flex={{ base: 0, md: 1 }}
          justify={{ base: "none", md: "flex-end" }}
        >
          <Flex display={{ base: "none", md: "flex" }} mr={10}>
            <DesktopNav />
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify="flex-end"
          direction="row"
          spacing={6}
        >
          {accounts && accounts.length > 0 ? (
            <Button
              as={ReachLink}
              fontSize="sm"
              fontWeight={400}
              variant="outline"
              bg="white"
              to={"/profile"}
              border="2px"
              borderRadius="none"
              borderColor="white"
              _focus={{
                outline: "none",
              }}
              _hover={{
                bg: "white",
                border: "2px",
                borderColor: "gray.900",
              }}
            >
              <RandomAvatar address={accounts[0].address} />
              <Text ml={2}>{getAccountName(accounts[0])}</Text>
            </Button>
          ) : (
            <Button
              as="a"
              fontSize="sm"
              fontWeight={400}
              variant="outline"
              bg="white"
              // href="#"
              border="2px"
              borderRadius="none"
              borderColor="gray.200"
              _hover={{
                bg: "white",
                borderColor: "gray.900",
              }}
              onClick={connectWallet}
            >
              Connect Wallet
            </Button>
          )}
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity={false}>
        <MobileNav />
      </Collapse>
    </Box>
  );
}

export default NavBar;
