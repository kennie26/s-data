import React from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import _ from 'lodash';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Modal, Box, Typography, CircularProgress, Stack, Alert, AlertTitle, Chip, TextField, Pagination } from '@mui/material';

import './App.css';
import { ISpecterSignal } from './interfaces/specter.signal';
import tableColumns from './config/tableColumns.json';
import detailAttributes from './config/detailAttributes.json';

import {
  StyledTableCell,
  StyledTableRow,
  style,
  rankingLabelStyle,
  paginationStyle
} from './styling/styling';

const DEFAULT_PAGE_SIZE = 10;

const getSignals = async () => {
  const { data } = await axios.get('./data/specterData.json');
  console.log(_.take(data,10));
  return data;
}

function App() {

  //open/close of modal
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  //select signal for modal to display details
  const [signal, setSignal] = React.useState({});
  const selectSignal = (signal: ISpecterSignal) => setSignal(signal);

  //update selected signal and open modal
  const selectRow = (row: ISpecterSignal) => {
    selectSignal(row);
    handleOpen();
  };

  //filter text on name and domain
  const [filterText, setFilterText] = React.useState('');
  const filterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(event.target.value);
  };

  //update selected page
  const [page, setPage] = React.useState(1);
  const pageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const getRankingLabel = (ranking: number) => {
    return `Ranking: ${ranking}`
  }

  const { data, status } = useQuery('posts', getSignals);

  const filteredData = () => {
    if (_.isNil(filterText) || _.isEmpty(filterText)) {
      return data;
    }
    return _.filter(data, signal => {
      return (
        _.includes(_.get(signal, 'Company Name'), filterText) ||
        _.includes(_.get(signal, 'Domain'), filterText)
      )
    })
  }

  const getDisplayRows: any = () => {
    if (_.size(filteredData()) <= DEFAULT_PAGE_SIZE) {
      return filteredData();
    }

    if ((page - 1) * DEFAULT_PAGE_SIZE > _.size(filteredData())) {
      return _.take(filteredData(), DEFAULT_PAGE_SIZE);
    }
    return _.slice(filteredData(), (page - 1) * DEFAULT_PAGE_SIZE, (page * DEFAULT_PAGE_SIZE) - 1);
  };

  const getNumberOfPages = () => {
    if (_.isEmpty(filteredData())) {
      return 0;
    }

    if (_.size(filteredData()) <= DEFAULT_PAGE_SIZE) {
      return 1;
    }

    return  _.ceil(_.size(filteredData()) / DEFAULT_PAGE_SIZE);
  };

  if (status === 'loading'){
    return (
      <div className="loading-container">
        <CircularProgress />
      </div>
    );
  }
  if (status === 'error'){
    return (
      <Stack sx={{ width: '100%' }} spacing={2}>
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        Error fetching data — <strong>try again later</strong>
      </Alert>
      </Stack>
    );
  }

  return (
    <div className="App">
      <div className='container'>
        <h1>Signals</h1>

        <div>
          <TextField
            sx={{ mb: 2, ml: 5, float: 'left' }}
            id="signal-filter"
            label="filter by name/domain"
            value={filterText}
            onChange={filterChange}
          />
          <Pagination 
            sx={paginationStyle}
            count={getNumberOfPages()}
            page={page}
            onChange={pageChange} 
          />
        </div>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow>
                {
                  tableColumns.map((columnName: string) => (
                    <StyledTableCell align="center">{columnName}</StyledTableCell>
                  ))
                }
              </TableRow>
            </TableHead>
            <TableBody>
              {getDisplayRows().map((row: ISpecterSignal) => (
                <StyledTableRow onClick={() => {selectRow(row)}}>
                  {
                    tableColumns.map((columnName: string) => (
                      <StyledTableCell component="th" scope="row" align="center">
                        {_.get(row, columnName)}
                      </StyledTableCell>                    
                    ))
                  }
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Modal
          open={open}
          onClose={handleClose}
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h3" component="h3">
              {_.get(signal, 'Company Name')}
            </Typography>
            <Chip 
              sx={rankingLabelStyle}
              label={getRankingLabel(_.get(signal, 'Rank'))}
              variant="outlined"
            />

            {
              detailAttributes.map((attr: string) => (
                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                  <b>{attr}:</b> {_.get(signal, attr)}
                </Typography>                
              ))
            }
          </Box>
        </Modal>
      </div>
    </div>
  );
}

export default App;
