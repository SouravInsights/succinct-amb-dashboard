import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { 
  Box, 
  Flex,
  HStack,
  Text,
  Input,
  Select,
  Button, 
  ButtonGroup, 
  Skeleton,
  Table,
  Thead,
  Tbody,
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
} from '@tanstack/react-table';

import { useConnect } from 'wagmi';
import { SuccinctGnosisContract, gasSpent, truncateTxHash, truncateAddress, peginateData } from '../utils/general';

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
  const { connect, connectors, isLoading, } = useConnect();
  
  /* 
    Succinct Gnosis Events 
  */

  useEffect(() => {
    if(!isLoading && connectors) {
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
          setData(eventsData);
        }
      }

      fetchSuccinctGnosisContractData();
    }
  }, [isLoading, connectors]);

  const defaultData = React.useMemo(() => [], []);
  const [data, setData] = React.useState(() => [...defaultData]);

  const [{ pageIndex, pageSize }, setPagination] =
  useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const fetchDataOptions = {
    pageIndex,
    pageSize
  };

  const paginatedData = peginateData(fetchDataOptions, data);

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  )

  const table = useReactTable({
    data: paginatedData?.rows ?? defaultData,
    columns,
    pageCount: paginatedData?.pageCount ?? -1,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    debugTable: true,
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
      <Flex mt='12rem' mb="40px" justify='center' align='center'>
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
          </Table>
        </TableContainer>
      </Flex>
      <HStack justify='center'>
        <Button  
          onClick={() => table.setPageIndex(0)} 
          isisDisabled={!table.getCanPreviousPage()}
        >
          {'<<'}
        </Button>
        <Button
          onClick={() => table.previousPage()}
          isisDisabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </Button>
        <Button
          onClick={() => table.nextPage()}
          isDisabled={!table.getCanNextPage()}
        >
          {'>'}
        </Button>
        <Button
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          isDisabled={!table.getCanNextPage()}
        >
          {'>>'}
        </Button>
        <HStack>
          <Text as='span'>
            Page &nbsp;
            <Text as='span' fontWeight='bold'>
              {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </Text>
          </Text>
          
          <Text as='span'>
            | Go to page:
          </Text>
            <Input
              type="number"
              defaultValue={table.getState().pagination.pageIndex + 1}
              onChange={e => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0
                table.setPageIndex(page)
              }}
              width='50px'
            />
        </HStack>
        <Select
          value={table.getState().pagination.pageSize}
          onChange={e => {
            table.setPageSize(Number(e.target.value))
          }}
          width='120px'
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </Select>
      </HStack>
    </Box>
  );
};
