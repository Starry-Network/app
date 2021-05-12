import React, { useEffect, useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Center,
  Stack,
  Box,
  HStack,
  Flex,
  Image,
  Spacer,
  Circle,
  Icon,
} from "@chakra-ui/react";
import { SmallCloseIcon } from "@chakra-ui/icons";
import { BiImageAdd } from "react-icons/bi";
import { useFormContext } from "react-hook-form";

export default function Upload({ label = "file" }) {
  const [childFiles, setChildFiles] = useState([]);

  const { register, unregister, setValue } = useFormContext();
  const onDrop = useCallback(
    (droppedFiles) => {
      droppedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
      setChildFiles(droppedFiles);
      setValue(label, droppedFiles, { shouldValidate: true });
    },
    [setValue, label]
  );

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    maxFiles: 1,
    onDrop,
  });

  useEffect(
    () => () => {
      childFiles.forEach((file) => URL.revokeObjectURL(file.preview));
    },
    [childFiles]
  );

  useEffect(() => {
    register(label, { required: true });
    return () => {
      unregister(label);
    };
  }, [register, unregister, label]);

  return (
    <HStack spacing="24px">
      {childFiles.length >= 1 ? (
        <Flex
          border="2px"
          w="full"
          borderStyle="dashed"
          borderColor="gray.300"
          minH="200px"
          justify="center"
        >
          <Flex justify={{ base: "none", md: "flex-start" }} flex={1}>
            <Spacer />
          </Flex>
          <Flex
            justify={{ base: "none", md: "flex-center" }}
            flex={1}
            align="center"
          >
            <Image
              boxSize="180px"
              objectFit="contain"
              src={childFiles[0].preview}
            />
          </Flex>
          <Flex justify={{ base: "none", md: "flex-end" }} flex={1}>
            <Box w="full" py={3}>
              <Circle
                size="35px"
                border="1px"
                borderColor="gray.300"
                _hover={{
                  cursor: "pointer",
                }}
                onClick={() => {
                  setChildFiles([]);
                  setValue(label, null, { shouldValidate: true });
                }}
              >
                <SmallCloseIcon />
              </Circle>
            </Box>
          </Flex>
        </Flex>
      ) : (
        <Center
          border="2px"
          w="full"
          borderStyle="dashed"
          borderColor="gray.300"
          minH="200px"
          color="gray.500"
          _hover={{
            cursor: "pointer",
          }}
          {...getRootProps({ className: "dropzone" })}
        >
          <input {...getInputProps()} id={label} />
          <Stack>
            <Center w={"full"}>
              <Icon w={10} h={10} as={BiImageAdd} />
            </Center>
            <p>Click or drag image to here to upload</p>
          </Stack>
        </Center>
      )}
    </HStack>
  );
}
