import React from "react";
import SuccinctABI from "../lib/abis/SuccinctABI.json"
import EnsRegistryABI from "../lib/abis/EnsRegistryAbi.json";

import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsAvatar,
  useEnsName,
  useContractEvent,
  useContractRead,
} from 'wagmi'

export default function App() {
  const { address, connector, isConnected } = useAccount()
  const { data: ensAvatar } = useEnsAvatar({ addressOrName: address })
  const { data: ensName } = useEnsName({ address })
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect()
  const { disconnect } = useDisconnect()

  useContractEvent({
    address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    abi: EnsRegistryABI,
    eventName: 'NewOwner',
    listener(node, label, owner) {
      console.log('Ens NewOwner events:', node, label, owner)
    },
  })

  useContractEvent({
    address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    abi: EnsRegistryABI,
    eventName: 'NewResolver',
    listener(node, label, owner) {
      console.log('Ens NewResolver events:', node, label, owner)
    },
  })

  useContractEvent({
    address: '0x68787ab0ca5a4a8cc82177b4e4f206765ce39956',
    abi: SuccinctABI,
    eventName: 'SentMessage',
    listener(node, label, owner) {
      console.log('Succinct events', node, label, owner)
    },
  })

  useContractEvent({
    address: '0x11f4B338c6127F0939d3D7CD56b1C9e6c4a68725',
    abi: SuccinctABI,
    eventName: 'ExecutedMessage',
    listener(node, label, owner) {
      console.log('Succinct gnosis amb events', node, label, owner)
    },
  })

 
  // const { data, isError } = useContractRead({
  //   address: '0x11f4B338c6127F0939d3D7CD56b1C9e6c4a68725',
  //   abi: SuccinctABI,
  //   functionName: 'executeMessage',
  // });

  // console.log('data',data);
  return (
    <div>
      {connectors?.map((connector) => (
        <button
          disabled={!connector?.ready}
          key={connector?.id}
          onClick={() => connect({ connector })}
        >
          {connector?.name}
          {!connector?.ready && ' (unsupported)'}
          {isLoading &&
            connector.id === pendingConnector?.id &&
            ' (connecting)'}
        </button>
      ))}
 
      {error && <div>{error.message}</div>}
    </div>
  );
};
