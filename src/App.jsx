import React, { useState, useEffect } from 'react';
import HawaiiMap from './components/HawaiiMap'; // Adjust the path as needed
import {
    ChakraProvider,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Button,
    Text,
    useDisclosure
} from '@chakra-ui/react';

const App = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    useEffect(() => {
        if (isFirstLoad) {
            onOpen(); // Open the modal when the page first loads
            setIsFirstLoad(false);
        }
    }, [isFirstLoad, onOpen]);

    return (
        <ChakraProvider>
            <HawaiiMap />
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Welcome to the Hawaii Map Page</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text>
                            This page allows you to explore a map of Hawaii and view various tiles based on zoom levels.
                            You can adjust the zoom level using the controls, and the number of tiles loaded will be displayed.
                        </Text>
                        <Button mt={4} colorScheme="teal" onClick={onClose}>
                            Got it!
                        </Button>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </ChakraProvider>
    );
};

export default App;
