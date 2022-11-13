import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { 
  Box, 
  Flex,
  VStack,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useDisclosure,
} from '@chakra-ui/react';

import { useConnect, useNetwork, useSwitchNetwork,useAccount } from 'wagmi';
import { SuccinctGnosisContract, gasSpent, truncateTxHash, truncateAddress, peginateData } from '../utils/general';
import { NavBar, DataTable, Section } from "../components";

export default function App() {
  const { isConnected, address } = useAccount()
  const { connect, connectors, isLoading, pendingConnector } = useConnect();

  const { isOpen: isWalletModalOpen, onOpen: onWalletModalOpen, onClose: onWalletModalClose } = useDisclosure();

  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const handleModalClick = (connector) => {
    connect({ connector });
    onWalletModalClose();
  }

  const [data, setData] = useState(() => [], []);

  /* 
    Succinct Gnosis Events 
  */

  useEffect(() => {
    if(isConnected && chain?.id === 100) {
      const fetchSuccinctGnosisContractData = async () => {
        let eventFilter = SuccinctGnosisContract.filters.ExecutedMessage();
        let events = await SuccinctGnosisContract.queryFilter(eventFilter, "0x0", "0x17B1CCC");

        if(events) {
          const eventsData = await Promise.all(
            events.map(async (item) => {
              const decodedEvent = await item.decode(item.data, item.topics);
              const parsedMessage = await ethers.utils.defaultAbiCoder.decode(['uint256', 'address', 'address', 'uint16', 'uint256', 'bytes'], decodedEvent.message);
              const txreceipt = await item.getTransactionReceipt();
              const messageData = {
                message: decodedEvent.message,
                txHash: truncateTxHash(txreceipt.transactionHash),
                sender: truncateAddress(parsedMessage[1]),
                status: decodedEvent.status,
                recipient: truncateAddress(parsedMessage[2]),
                gasPaid: `${gasSpent(txreceipt)} xDAI`,
                executedBy: truncateAddress(txreceipt.from),
              }
              return messageData;
            })
          )
          setData(eventsData);
        }
      }

      fetchSuccinctGnosisContractData();
    }
  }, [isConnected, chain?.id]);

  return (
    <Box >
      <NavBar connectWalletClick={onWalletModalOpen} isConnected={isConnected} address={address} />
      <Modal isOpen={isWalletModalOpen} onClose={onWalletModalClose} isCentered closeOnOverlayClick>
        <ModalOverlay  style={{ backdropFilter: 'blur(16px)' }} />
        <ModalContent bg='white'>
          <ModalBody>
            <VStack py={8} px={2}>
              {connectors?.map((connector) => (
                <Button
                  key={connector?.id}
                  onClick={() => handleModalClick(connector)}
                  isDisabled={!connector.ready}
                  w='full'
                  bg='#5a43cc' color='white' 
                  _hover={{ bg: "#4731b5"}} 
                  _active={{ bg: "#4731b5"}}
                >
                  {connector.name}
                  {!connector.ready && ' (unsupported)'}
                  {isLoading &&
                    connector.id === pendingConnector?.id &&
                    ' (connecting)'}
                </Button>
              ))}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Flex justify='center' align='center' my='8rem'>
        {!isConnected ? (
          <Section 
            imgSrc='./not-connected.png'
            heading='Wallet Not Connected! 🫣'
          >
            <Button bg='#5a43cc' color='white' _hover={{ bg: "#4731b5"}} _active={{ bg: "#4731b5"}} onClick={onWalletModalOpen}>
              Connect Your Wallet
            </Button>
          </Section>
        ) : chain?.id != 100 ? (
            <Section 
              imgSrc='./wrong-network.png'
              heading='Oops! Wrong Network... 🙃'
            >
              <Button
                onClick={() => switchNetwork(100)}
                bg='#5a43cc' color='white' _hover={{ bg: "#4731b5"}} _active={{ bg: "#4731b5"}}
              >
                Switch to Gnosis
              </Button>
            </Section>
        ) : (
          <Flex direction='column'>
            <Section 
              imgSrc='./welcome.png'
              heading='Hey! 👋 Lets dive in...'
            />
            <DataTable data={data} />
          </Flex>
        )}
      </Flex>
    </Box>
  );
};
