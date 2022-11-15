import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  VStack,
  HStack,
  Stack,
  Text,
  Input,
  Select,
  Button, 
  Link,
  Tag, 
  TagLabel,
  TagRightIcon,
  Tooltip,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getSortedRowModel,
} from '@tanstack/react-table';
import { peginateData } from '../utils/general';
import { MdFastForward, MdFastRewind } from 'react-icons/md';
import { FaCaretLeft, FaCaretRight, FaCheck, FaTimes } from 'react-icons/fa'
import { truncateTxHash, truncateAddress, parseMessage } from '../utils/general';

export const DataTable = ({ data }) => {

  const ToolTipContent = (content) => {
    return (
      <Stack p={4}>
        <Text color='white' as='h1' fontWeight='bold'>
          Nonce:&nbsp;
          <Text as='span' color='white' fontWeight='normal'>{Number(content.content[0]._hex)}</Text>
        </Text>
        <Text color='white' as='h1' fontWeight='bold'>
          Sender:&nbsp;
          <Text as='span' color='white' fontWeight='normal'>{content.content[1]}</Text>
        </Text>
        <Text color='white' as='h1' fontWeight='bold'>
          Receiver:&nbsp;
          <Text as='span' color='white' fontWeight='normal'>{content.content[2]}</Text>
        </Text>
        <Text color='white' as='h1' fontWeight='bold'>
          Chain Id:&nbsp;
          <Text as='span' color='white' fontWeight='normal'>{content.content[3]}</Text>
        </Text>
        <Text color='white' as='h1' fontWeight='bold'>
          Gas Limit:&nbsp;
          <Text as='span' color='white' fontWeight='normal'>{Number(content.content[4]._hex)}</Text>
        </Text>
      </Stack>
    )
  }

  const columnHelper = createColumnHelper();
  
  const columns = [
    columnHelper.accessor('sender', {
      id: 'sender',
      header: 'Sender',
      cell: info => (
        <Tooltip p={4} bg='#5a43cc' openDelay={500} hasArrow label={info.getValue()} fontSize='md'>
          <Link href={`https://blockscout.com/xdai/mainnet/address/${info.getValue()}`} isExternal>
            <span>
              {truncateAddress(info.getValue())}
            </span>
          </Link>
        </Tooltip>
      ),
    }),
    columnHelper.accessor('recipient', {
      id: 'recipient',
      header: 'Recipient',
      cell: info => (
        <Tooltip p={4} bg='#5a43cc' hasArrow label={info.getValue()} fontSize='md'>
          <Link href={`https://blockscout.com/xdai/mainnet/address/${info.getValue()}`} isExternal>
            <span>
              {truncateAddress(info.getValue())}
            </span>
          </Link>
        </Tooltip>
      ),
    }),
    columnHelper.accessor('message', {
      cell: info => <Tooltip bg='#5a43cc' hasArrow label={<ToolTipContent content={parseMessage(info.getValue())} />} fontSize='md'><span>{truncateAddress(info.getValue())}</span></Tooltip>,
    }),
    columnHelper.accessor('status', {
      header: () => <span>Status</span>,
      cell: info => info.getValue() === true ? (
          <Tag variant='subtle' bg='#2E7D32' color='white'>
            <TagLabel>Received</TagLabel>
            <TagRightIcon boxSize='12px' as={FaCheck} />
          </Tag> 
        ) : (
          <Tag variant='subtle' bg='#f44336' color='white'>
            <TagLabel>Not Received</TagLabel>
            <TagRightIcon boxSize='12px' as={FaTimes} />
          </Tag> 
        )
    }),
    columnHelper.accessor(row => row.txHash, {
      id: 'txHash',
      cell: info => (
        <Tooltip p={4} bg='#5a43cc' hasArrow label={info.getValue()} fontSize='md'>
          <Link href={`https://blockscout.com/xdai/mainnet/tx/${info.getValue()}`} isExternal>
            <span>{truncateTxHash(info.getValue())}</span>
          </Link>
        </Tooltip>
      ),
      header: () => <span>Tx Hash of Message</span>,
    }),
    columnHelper.accessor('gasPaid', {
      header: 'Gas Paid',
    }),
    columnHelper.accessor('executedBy', {
      id: 'executedBy',
      cell: info => (
        <Tooltip p={4} bg='#5a43cc' hasArrow label={info.getValue()} fontSize='md'>
          <Link href={`https://blockscout.com/xdai/mainnet/address/${info.getValue()}`} isExternal>
            <span>
              {truncateAddress(info.getValue())}
            </span>
          </Link>
        </Tooltip>
      ),
      header: 'Executed By',
    }),
  ]

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

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  )

  const [columnFilters, setColumnFilters] = useState([]);

  const table = useReactTable({
    data: paginatedData.rows,
    columns,
    pageCount: paginatedData?.pageCount ?? -1,
    state: {
      pagination,
      columnFilters,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    debugTable: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    onColumnFiltersChange: setColumnFilters,
    debugHeaders: true,
    debugColumns: false,
  });

  return (
    <VStack spacing={12} my={16}>
      <TableContainer maxWidth='1000px' bg='white' color='white'>
        <Table color='#5a43cc'>
          <Thead>
            {table.getHeaderGroups().map(headerGroup => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <Th border='4px' borderColor='#5a43cc' color='#5a43cc' fontSize='bold'  key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <Stack>
                        <Box>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </Box>
                        {header.column.getCanFilter() ? (
                          <Box>
                            <Filter column={header.column} table={table} />
                          </Box>
                        ) : null}
                      </Stack>
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
                  <Td border='4px' key={cell.id}>
                    <Text color='#191919' fontWeight='medium'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Text>
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <HStack justify='center' color='black'>
        <Button  
          onClick={() => table.setPageIndex(0)} 
          isDisabled={!table.getCanPreviousPage()}
          bg='#5a43cc' _hover={{ bg: "#4731b5"}}
        >
          <MdFastRewind color='white' />
        </Button>
        <Button
          onClick={() => table.previousPage()}
          isDisabled={!table.getCanPreviousPage()}
          bg='#5a43cc' _hover={{ bg: "#4731b5"}}
        >
          <FaCaretLeft color='white' />
        </Button>
        <Button
          onClick={() => table.nextPage()}
          isDisabled={!table.getCanNextPage()}
          bg='#5a43cc' _hover={{ bg: "#4731b5"}}
        >
          <FaCaretRight color='white' />
        </Button>
        <Button
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          isDisabled={!table.getCanNextPage()}
          bg='#5a43cc' _hover={{ bg: "#4731b5"}}
        >
          <MdFastForward color='white' />
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
              border='2px' 
              borderColor='#5a43cc'
              _hover={{ border: '2px', borderColor: '#4731b5' }}
              _active={{ border: '2px', borderColor: '#4731b5' }}
            />
        </HStack>
        <Select
          value={table.getState().pagination.pageSize}
          onChange={e => {
            table.setPageSize(Number(e.target.value))
          }}
          width='120px'
          border='2px' 
          borderColor='#5a43cc'
          _hover={{ border: '2px', borderColor: '#4731b5' }}
          _active={{ border: '2px', borderColor: '#4731b5' }}
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </Select>
      </HStack>
    </VStack>
  )
}

const Filter = ({
  column,
  table,
}) => {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id)

  const columnFilterValue = column.getFilterValue()

  const sortedUniqueValues = useMemo(
    () =>
      typeof firstValue === 'number'
        ? []
        : Array.from(column.getFacetedUniqueValues().keys()).sort(),
    [column.getFacetedUniqueValues()]
  )

  return (
    <>
      <datalist id={column.id + 'list'}>
        {sortedUniqueValues.slice(0, 200).map((value) => (
          <option value={value} key={value} />
        ))}
      </datalist>
      <DebouncedInput
        type="text"
        value={(columnFilterValue ?? '')}
        onChange={value => column.setFilterValue(value)}
        placeholder={`Search... (${column.getFacetedUniqueValues().size})`}
        list={column.id + 'list'}
      />
    </>
  )
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}) => {
  const [value, setValue] = useState(initialValue);

 useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return (
    <Input 
      border='2px' 
      borderColor='#5a43cc'
      _hover={{ border: '2px', borderColor: '#4731b5' }}
      _active={{ border: '2px', borderColor: '#4731b5' }}
      width='180px' 
      value={value} 
      onChange={e => setValue(e.target.value)} 
      {...props} 
    />
  )
}