import React from "react";
import { ethers } from "ethers";
import SuccinctABI from "../lib/abis/SuccinctABI.json";
import { 
  Box, 
  Flex,
  Button, 
  ButtonGroup, 
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { useConnect, useProvider } from 'wagmi';
import { SuccinctGnosisContract, gasSpent, truncateTxHash } from '../utils/general';

const defaultData = [
  {
    message: '0000000000000e8a7f02499402a...',
    txHash: '0xf1c02eeba51e8b84...',
    sender: '0xF95f...226e',
    status: true,
    recipient: '0xF95f...226e',
    gasPaid: 0.000919752004292176,
    executedBy: '0xF95f...226e',
  },
  {
    message: '0000000000000e8a7f02499402a...',
    txHash: '0xf1c02eeba51e8b84...',
    sender: '0xF95f...226e',
    status: true,
    recipient: '0xF95f...226e',
    gasPaid: 0.000919752004292176,
    executedBy: '0xF95f...226e',
  },
  {
    message: '0000000000000e8a7f02499402a...',
    txHash: '0xf1c02eeba51e8b84...',
    sender: '0xF95f...226e',
    status: false,
    recipient: '0xF95f...226e',
    gasPaid: 0.000919752004292176,
    executedBy: '0xF95f...226e',
  },
]

const columnHelper = createColumnHelper();

const columns = [
  columnHelper.accessor('message', {
    cell: info => info.getValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor(row => row.txHash, {
    id: 'txHash',
    cell: info => <i>{info.getValue()}</i>,
    header: () => <span>Tx Hash of Message</span>,
    footer: info => info.column.id,
  }),
  columnHelper.accessor('sender', {
    header: () => 'Sender',
    cell: info => info.renderValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('status', {
    header: () => <span>Status</span>,
    footer: info => info.column.id,
  }),
  columnHelper.accessor('recipient', {
    header: 'Recipient',
    footer: info => info.column.id,
  }),
  columnHelper.accessor('gasPaid', {
    header: 'Gas Paid',
    footer: info => info.column.id,
  }),
  columnHelper.accessor('executedBy', {
    header: 'Executed By',
    footer: info => info.column.id,
  }),
]

export default function App() {
  const { connect, connectors, isLoading, error } = useConnect();
  const provider = useProvider();

   /* 
    Succinct Gnosis Events 
  */

  const fetchSuccinctGnosisContractData = async () => {
    let eventFilter = SuccinctGnosisContract.filters.ExecutedMessage();

    let events = await SuccinctGnosisContract.queryFilter(eventFilter, "0x0", "0x17665A7");
    console.log('Gnosis Contract events:', events);

    events.map(async (item) => {
      const decodedEvent = await item.decode(item.data, item.topics);
      console.log('decodedEvents of Gnosis Contract', decodedEvent);
      const parsedMessage = await ethers.utils.defaultAbiCoder.decode(['uint256', 'address', 'address', 'uint16', 'uint256', 'bytes'], decodedEvent.message);
      console.log('parsedMessage', parsedMessage);
      const txreceipt = await item.getTransactionReceipt();
      console.log('gnosis txreceipt:', txreceipt);
      const tx = await item.getTransaction();
      console.log('Gnosis tx:', tx);
    })
  }

  fetchSuccinctGnosisContractData();

  
  /* 
    Succinct Goreli Events 
  */

  const SuccinctGoreliContract = new ethers.Contract(
    '0x68787ab0ca5a4a8cc82177b4e4f206765ce39956',
    SuccinctABI,
    provider
  )

  const fetchSuccinctGoreliContractData = async () => {
    let eventFilter = SuccinctGoreliContract.filters.SentMessage();

    const events = await SuccinctGoreliContract.queryFilter(eventFilter, "0x0", "0x762890");
    console.log('Goreli events:', events);

    events.map(async (item) => {
      const decodedEvent = await item.decode(item.data, item.topics);
      console.log('decodedEvents from Goreli Contract', decodedEvent);
      const txreceipt = await item.getTransactionReceipt();
      console.log('Goreli txreceipt:', txreceipt);
      const tx = await item.getTransaction();
      console.log('Goreli tx:', tx);
    })
  }

  fetchSuccinctGoreliContractData();

  const [data, setData] = React.useState(() => [...defaultData]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const hash = truncateTxHash('0xf1c02eeba51e8b848b7f288f83967832bc469a82a237097370f21aa8a849409f');
  console.log('hash:', hash)

  return (
    <Box>
      <ButtonGroup>
        {connectors?.map((connector) => (
          <Button
            disabled={!connector?.ready}
            key={connector?.id}
            onClick={() => connect({ connector })}
          >
            {connector?.name}
            {!connector?.ready && ' (unsupported)'}
            {isLoading &&
              connector.id === pendingConnector?.id &&
              ' (connecting)'}
          </Button>
        ))}
      </ButtonGroup>
      {error && <div>{error.message}</div>}

      <Flex my='12rem' justify='center' align='center'>
        <TableContainer>
          <Table size="sm" variant='striped' colorScheme='teal'>
            <Thead>
              {table.getHeaderGroups().map(headerGroup => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <Th key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </Th>
                  ))}
                </Tr>
              ))}
            </Thead>
            <Tbody>
              {table.getRowModel().rows.map(row => (
                <Tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <Td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
            <Tfoot>
              {table.getFooterGroups().map(footerGroup => (
                <Tr key={footerGroup.id}>
                  {footerGroup.headers.map(header => (
                    <Th key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.footer,
                            header.getContext()
                          )}
                    </Th>
                  ))}
                </Tr>
              ))}
            </Tfoot>
          </Table>
        </TableContainer>
      </Flex>
    </Box>
  );
};
