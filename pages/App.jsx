import React, { useEffect } from "react";
import { ethers } from "ethers";
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

import { useConnect } from 'wagmi';
import { SuccinctGnosisContract, gasSpent, truncateTxHash, truncateAddress } from '../utils/general';

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
  const { connect, connectors, isLoading } = useConnect();

   /* 
    Succinct Gnosis Events 
  */

  useEffect(() => {
    if(isLoading === false) {
      const fetchSuccinctGnosisContractData = async () => {
        let eventFilter = SuccinctGnosisContract.filters.ExecutedMessage();
        let events = await SuccinctGnosisContract.queryFilter(eventFilter, "0x0", "0x1769707");
        // console.log('Gnosis Contract events:', events);

        const eventsData = await Promise.all(
          events.map(async (item) => {
            const decodedEvent = await item.decode(item.data, item.topics);
            const parsedMessage = await ethers.utils.defaultAbiCoder.decode(['uint256', 'address', 'address', 'uint16', 'uint256', 'bytes'], decodedEvent.message);
            const txreceipt = await item.getTransactionReceipt();
            const messageData = {
              message: truncateTxHash(decodedEvent.message),
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
        // console.log('eventsData', eventsData);
        setData(eventsData);
      }

      fetchSuccinctGnosisContractData();
    }
  }, []);

  const [data, setData] = React.useState(() => [...defaultData]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Box>
      <ButtonGroup>
        {connectors?.map((connector) => (
          <Button
            key={connector?.id}
            onClick={() => connect({ connector })}
          >
            {connector?.name}
          </Button>
        ))}
      </ButtonGroup>
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
