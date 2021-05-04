import { useToast, SimpleGrid } from "@chakra-ui/react";
import { stringToHex } from "@polkadot/util";

import { useApi } from "../utils/api";
import { useTransaction } from "../utils/transaction";
import TokenCard from "../components/TokenCard";

function Home() {
  const toast = useToast();

  console.log(stringToHex("qaq"));
  const { api, accounts, modules, ready } = useApi();
  const newTransaction = useTransaction({
    api,
    accounts,
    modules,
    toast,
  });

  return (
    <SimpleGrid minChildWidth="280px" py={12}>
      <TokenCard />
      <TokenCard url="https://ipfs.rarible.com/ipfs/QmP4rvmwRcx7mUKAKhtLgfjNi11F5kEQAXxB3CFZp6Kz3c/image.jpeg" />
      <TokenCard url="https://lh3.googleusercontent.com/NNf1COFJ0u8WNyteepk192LxFe-HwFThj5j4dP4whcyUixB2ItuD1cTt5NBOnGjHTZc0JmmjVI47sH79elDI-kex=s250" />
      <TokenCard url="https://lh3.googleusercontent.com/NNf1COFJ0u8WNyteepk192LxFe-HwFThj5j4dP4whcyUixB2ItuD1cTt5NBOnGjHTZc0JmmjVI47sH79elDI-kex=s250" />
      <TokenCard url="https://lh3.googleusercontent.com/NNf1COFJ0u8WNyteepk192LxFe-HwFThj5j4dP4whcyUixB2ItuD1cTt5NBOnGjHTZc0JmmjVI47sH79elDI-kex=s250" />
      <TokenCard url="https://images.unsplash.com/photo-1518051870910-a46e30d9db16?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1350&q=80" />
      <TokenCard url="https://lh3.googleusercontent.com/NNf1COFJ0u8WNyteepk192LxFe-HwFThj5j4dP4whcyUixB2ItuD1cTt5NBOnGjHTZc0JmmjVI47sH79elDI-kex=s250" />
      <TokenCard url="https://d7hftxdivxxvm.cloudfront.net?resize_to=fit&src=http%3A%2F%2Ffiles.artsy.net%2Fimages%2Fthumbnails%2Fpost-war.png&width=357&height=175&quality=80" />{" "}
    </SimpleGrid>
    //  </Center>
    // </Container>
  );
}

export default Home;
