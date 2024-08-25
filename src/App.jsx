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
                            This page is designed to help you understand how tile layers work by showing you the number of tiles required at each zoom level.
                            While the map is centered on Hawaii, the focus is on exploring how zoom levels affect the number of tiles, helping you grasp why tile calculations are essential for different states.
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
