import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Stack,
  Text,
  Input,
  Select,
  Button, 
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
import { MdFastForward, MdFastRewind, MdSkipPrevious, MdSkipNext } from 'react-icons/md'

const columnHelper = createColumnHelper();

const columns = [
  columnHelper.accessor('sender', {
    header: () => 'Sender',
    cell: info => info.renderValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('recipient', {
    header: 'Recipient',
    footer: info => info.column.id,
  }),
  columnHelper.accessor('status', {
    header: () => <span>Status</span>,
    footer: info => info.column.id,
  }),
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
  columnHelper.accessor('gasPaid', {
    header: 'Gas Paid',
    footer: info => info.column.id,
  }),
  columnHelper.accessor('executedBy', {
    header: 'Executed By',
    footer: info => info.column.id,
  }),
]

export const DataTable = ({ data }) => {

  const defaultData = React.useMemo(() => [], []);

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

  const [columnFilters, setColumnFilters] = useState([]);

  const table = useReactTable({
    data: paginatedData?.rows ?? defaultData,
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

  useEffect(() => {
    if (table.getState().columnFilters[0]?.id === 'sender') {
      if (table.getState().sorting[0]?.id !== 'sender') {
        table.setSorting([{ id: 'sender', desc: false }])
      }
    }
  }, [table.getState().columnFilters[0]?.id])

  return (
    <VStack spacing={12}>
      <TableContainer maxWidth='1000px' bg='black' color='white'>
        <Table color='#5a43cc'>
          <Thead>
            {table.getHeaderGroups().map(headerGroup => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <Th border='2px' borderColor='#5a43cc' color="#5a43cc"  key={header.id} colSpan={header.colSpan}>
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
              <Tr border='2px' key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <Td border='2px' key={cell.id}>
                    <Text color='white'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Text>
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <HStack justify='center' color='white'>
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
          <MdSkipPrevious color='white' />
        </Button>
        <Button
          onClick={() => table.nextPage()}
          isDisabled={!table.getCanNextPage()}
          bg='#5a43cc' _hover={{ bg: "#4731b5"}}
        >
          <MdSkipNext color='white' />
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

  const sortedUniqueValues = React.useMemo(
    () =>
      typeof firstValue === 'number'
        ? []
        : Array.from(column.getFacetedUniqueValues().keys()).sort(),
    [column.getFacetedUniqueValues()]
  )

  return typeof firstValue === 'number' ? (
    <div>
      <div>
        <DebouncedInput
          type="number"
          min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
          max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
          value={(columnFilterValue)?.[0] ?? ''}
          onChange={value =>
            column.setFilterValue((old) => [value, old?.[1]])
          }
          placeholder={`Min ${
            column.getFacetedMinMaxValues()?.[0]
              ? `(${column.getFacetedMinMaxValues()?.[0]})`
              : ''
          }`}
        />
        <DebouncedInput
          type="number"
          min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
          max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
          value={(columnFilterValue)?.[1] ?? ''}
          onChange={value =>
            column.setFilterValue((old) => [old?.[0], value])
          }
          placeholder={`Max ${
            column.getFacetedMinMaxValues()?.[1]
              ? `(${column.getFacetedMinMaxValues()?.[1]})`
              : ''
          }`}
        />
      </div>
    </div>
  ) : (
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
  const [value, setValue] = useState(initialValue)

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
      width='200px' 
      value={value} 
      onChange={e => setValue(e.target.value)} 
      {...props} 
    />
  )
}