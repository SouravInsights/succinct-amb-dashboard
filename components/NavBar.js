import React from 'react';
import { HStack, Heading, Button } from '@chakra-ui/react';
import { useDisconnect, useEnsName } from 'wagmi'
import { truncateAddress } from '../utils/general';

export const NavBar = ({ connectWalletClick, isConnected, address }) => {
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address })

  return (
    <HStack
      as='nav'
      w='90%'
      px='20px'
      py='14px'
      mx='auto'
      top='20px'
      position='sticky'
      align='center'
      justify='space-between'
      bg='white'
      border='4px'
      borderColor='#5a43cc'
      color='white'
      borderRadius='10px'
      boxShadow='0px 10px 20px rgba(0, 0, 0, 0.05);'
      display='flex'
      zIndex={4}
    >
      <Heading color="#5a43cc" fontSize= "35px" fontWeight="400">Succinct</Heading>
      {isConnected ? (
        <HStack spacing={4}>
          <Heading color="#5a43cc" fontSize= "22px" fontWeight="semibold">
            {ensName || `${truncateAddress(address)}`}
          </Heading>
          <Button bg='#5a43cc' color='white' _hover={{ bg: "#4731b5"}} _active={{ bg: "#4731b5"}} onClick={() => disconnect()}>
            Disconnect
          </Button>
        </HStack>
      ): (
        <Button bg='#5a43cc' color='white' _hover={{ bg: "#4731b5"}} _active={{ bg: "#4731b5"}} onClick={connectWalletClick}>
          Connect Your Wallet
        </Button>
      )}
    </HStack>
  );
};
