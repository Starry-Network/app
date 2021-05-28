import {
  Button,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Spinner,
} from "@chakra-ui/react";

const WaitingDialog = ({ dialogIsOpen, closeDialog }) => {
  return (
    <>
      <AlertDialog isOpen={dialogIsOpen}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Waiting
            </AlertDialogHeader>

            <AlertDialogBody>
              Data updated in about 15~20s <Spinner />
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button colorScheme="black" onClick={closeDialog} ml={3}>
                close
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default WaitingDialog;
