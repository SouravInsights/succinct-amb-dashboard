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
import { DataTable } from "../components/DataTable";
import NavBar from "../components/NavBar";

export default function App() {
  const { isConnected, address } = useAccount()
  const { connect, connectors, isLoading, pendingConnector } = useConnect();
  console.log('isConnected:', isConnected);
  
  const { chain } = useNetwork();
  console.log('chain:', chain);
  const { chains, pendingChainId, switchNetwork } = useSwitchNetwork();

  const [data, setData] = React.useState(() => [], []);

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

  const { isOpen: isWalletModalOpen, onOpen: onWalletModalOpen, onClose: onWalletModalClose } = useDisclosure();

  // const [ networkModalisOpen, setNetworkModalIsOpen ] = useState();
  // const { isOpen: isNetworkModalOpen, onOpen: onNetworkModalOpen, onClose: onNetworkModalClose } = useDisclosure();

  return (
    <Box >
      <NavBar connectWalletClick={onWalletModalOpen} isConnected={isConnected} address={address} />
      <Modal isOpen={isWalletModalOpen} onClose={onWalletModalClose} isCentered closeOnOverlayClick>
        <ModalOverlay  style={{ backdropFilter: 'blur(16px)' }} />
        <ModalContent bg='#5a43cc'>
          <ModalBody>
            <VStack py={4}>
              {connectors?.map((connector) => (
                <Button
                  key={connector?.id}
                  onClick={() => connect({ connector })}
                  isDisabled={!connector.ready}
                  w='full'
                  bg='black' color='white' 
                  _hover={{ bg: "blackAlpha.800"}} 
                  _active={{ bg: "blackAlpha.800"}}
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
      {/* <Modal isOpen={networkModalisOpen} onClose={onNetworkModalOpen} isCentered>
        <ModalOverlay style={{ backdropFilter: 'blur(16px)' }} />
        <ModalContent bg='#5a43cc'>
          <ModalBody>
            <VStack py={4}>
              {chains.map((x) => (
                <Button
                  isDisabled={!switchNetwork || x.id === chain?.id}
                  key={x.id}
                  onClick={() => switchNetwork?.(x.id)}
                  w='full'
                  bg='black' color='white' 
                  _hover={{ bg: "blackAlpha.800"}} 
                  _active={{ bg: "blackAlpha.800"}}
                >
                  {x.name}
                  {isLoading && pendingChainId === x.id && ' (switching)'}
                </Button>
              ))}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal> */}
      <Flex justify='center' align='center' my='8rem'>
        {!isConnected ? (
          <Button bg='#5a43cc' color='white' _hover={{ bg: "#4731b5"}} _active={{ bg: "#4731b5"}} onClick={onWalletModalOpen}>
            Connect Your Wallet
          </Button>
        ) : chain?.id != 100 ? (
            <Button
              onClick={() => switchNetwork(100)}
              bg='#5a43cc' color='white' _hover={{ bg: "#4731b5"}} _active={{ bg: "#4731b5"}}
            >
              Switch to Gnosis
            </Button>
        ) : (
          <DataTable data={data} />
        )}
      </Flex>
    </Box>
  );
};
